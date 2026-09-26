/**
 * MarketingCloudTriggerHandler
 *
 * The only place trigger logic lives. Every trigger is a one-line delegation,
 * because a trigger with logic in it cannot be unit tested, cannot be ordered
 * predictably and cannot be reused from a flow or a data migration.
 *
 * Each entry point is re-entrant safe: it reads Trigger.isBefore/Trigger.isAfter
 * and only performs work the phase allows, so the same handler serves a before
 * save, an after save and a scheduled re-run.
 */
public with sharing class MarketingCloudTriggerHandler {
    /**
     * Contact master: stamp sync time and keep the match rate meaningful.
     *
     * Before-phase only. Doing this in the after phase would mean the row is
     * already visible to another process without its sync stamp.
     */
    public static void onContactMaster(List<Contact_Master__c> newRecords, List<Contact_Master__c> oldRecords) {
        for (Contact_Master__c c : newRecords) {
            if (c.LastSyncedAt__c == null) {
                c.LastSyncedAt__c = Datetime.now();
            }
            if (c.Email__c != null) {
                c.Email__c = DataExtensionSyncService.normaliseKey(c.Email__c);
            }
            if (c.ProfileMatchRate__c == null) {
                c.ProfileMatchRate__c = 100;
            }
        }
    }

    /**
     * Consent preference: enforce terminal opt-out and stamp the decision.
     *
     * The opt-out is stamped here rather than only in the service so that a
     * direct data load or a flow update cannot set an opt-in over an opt-out.
     */
    public static void onConsentPreference(List<Consent_Preference__c> newRecords, List<Consent_Preference__c> oldRecords) {
        for (Consent_Preference__c c : newRecords) {
            if (c.CapturedDate__c == null) {
                c.CapturedDate__c = Datetime.now();
            }
            if (c.RecordedBy__c == null) {
                c.RecordedBy__c = UserInfo.getUserName();
            }
            if (c.Status__c == ConsentSyncService.STATUS_OPTED_OUT && c.OptedOutDate__c == null) {
                c.OptedOutDate__c = Datetime.now();
            }
        }
    }

    /**
     * Journey entry log: publish the decision as a platform event.
     *
     * After-phase only, and one event per record. Publishing in the before phase
     * would emit decisions for rows that later fail to commit.
     */
    public static void onJourneyEntryLog(List<Journey_Entry_Log__c> newRecords) {
        List<Journey_Entry_Decision__e> events = new List<Journey_Entry_Decision__e>();
        for (Journey_Entry_Log__c j : newRecords) {
            events.add(new Journey_Entry_Decision__e(
                Journey_Name__c = j.Journey__c,
                Contact_Key__c = String.valueOf(j.Contact__c),
                Decision__c = j.Decision__c,
                Reason__c = j.Reason__c,
                Frequency_Cap_Applied__c = j.Frequency_Cap_Applied__c == true
            ));
        }
        if (!events.isEmpty()) {
            List<Database.SaveResult> results = EventBus.publish(events);
            for (Database.SaveResult sr : results) {
                if (!sr.isSuccess()) {
                    System.debug(LoggingLevel.ERROR, 'Journey entry event publish failed: ' + sr.getErrors()[0].getMessage());
                }
            }
        }
    }

    /**
     * Marketing interaction: recompute the rolling 30-day marketing count.
     *
     * Stored on the row so the frequency cap is a single indexed read instead
     * of a count over the whole interaction table on every journey entry.
     */
    public static void onMarketingInteraction(List<Marketing_Interaction__c> newRecords, List<Marketing_Interaction__c> oldRecords) {
        Set<Id> contacts = new Set<Id>();
        for (Marketing_Interaction__c i : newRecords) {
            if (i.Contact__c != null) {
                contacts.add(i.Contact__c);
            }
        }
        if (contacts.isEmpty()) {
            return;
        }
        for (Id contactId : contacts) {
            Integer count = [
                SELECT COUNT()
                FROM Marketing_Interaction__c
                WHERE Contact__c = :contactId
                  AND Marketing__c = true
                  AND InteractionDate__c = LAST_N_DAYS:30
            ];
            for (Marketing_Interaction__c i : newRecords) {
                if (i.Contact__c == contactId) {
                    i.Frequency_30d__c = count;
                }
            }
        }
    }

    /**
     * Sync log: a failed run is an operational event, not a log line.
     *
     * A failed import that nobody is told about is how a partial audience gets
     * sent to.
     */
    public static void onSyncLog(List<Data_Extension_Sync_Log__c> newRecords) {
        for (Data_Extension_Sync_Log__c s : newRecords) {
            if (s.Status__c == 'Failed') {
                System.debug(LoggingLevel.ERROR,
                    'Data extension sync failed. Source ' + s.SourceSystem__c
                    + ', object ' + s.Object_Name__c
                    + ', rows in ' + s.RecordsIn__c
                    + ', error ' + s.ErrorMessage__c
                );
            }
        }
    }

    /**
     * Training question: exactly one correct option.
     *
     * A question bank with two correct answers produces an exam where a
     * candidate can be right and marked wrong.
     */
    public static void onTrainingQuestion(List<Training_Question__c> newRecords) {
        for (Training_Question__c q : newRecords) {
            Set<String> answers = new Set<String>();
            for (String option : new List<String>{ 'A', 'B', 'C', 'D' }) {
                String value = (String) q.get('Option' + option + '__c');
                if (String.isNotBlank(value)) {
                    answers.add(option);
                }
            }
            if (answers.size() < 2) {
                q.addError('A question needs at least two options.');
            }
            if (q.CorrectOption__c != null && !answers.contains(q.CorrectOption__c)) {
                q.addError('The correct option ' + q.CorrectOption__c + ' has no matching option text.');
            }
        }
    }

    /**
     * Lead: apply the territory routing rules.
     *
     * The routing service decides; the trigger only stages the owner change so
     * it participates in the record's save.
     */
    public static void onLead(List<Lead> newRecords) {
        for (Lead lead : newRecords) {
            LeadRoutingForCampaignsService.Assignment assignment = LeadRoutingForCampaignsService.route(lead);
            if (assignment.assignedToId != null) {
                lead.OwnerId = assignment.assignedToId;
            }
        }
    }
}
