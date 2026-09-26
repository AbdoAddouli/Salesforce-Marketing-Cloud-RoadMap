trigger Marketing_Interaction_Trigger on Marketing_Interaction__c (before insert, before update, after insert, after update) {
    MarketingCloudTriggerHandler.onMarketingInteraction(Trigger.new, Trigger.old);
}