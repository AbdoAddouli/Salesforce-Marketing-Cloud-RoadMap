trigger Journey_Entry_Log_Trigger on Journey_Entry_Log__c (after insert) {
    MarketingCloudTriggerHandler.onJourneyEntryLog(Trigger.new);
}