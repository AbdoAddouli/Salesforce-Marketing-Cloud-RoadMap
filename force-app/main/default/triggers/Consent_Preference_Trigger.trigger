trigger Consent_Preference_Trigger on Consent_Preference__c (before insert, before update) {
    MarketingCloudTriggerHandler.onConsentPreference(Trigger.new, Trigger.old);
}