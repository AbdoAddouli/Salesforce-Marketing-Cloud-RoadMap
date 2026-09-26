trigger Data_Extension_Sync_Log_Trigger on Data_Extension_Sync_Log__c (after insert) {
    MarketingCloudTriggerHandler.onSyncLog(Trigger.new);
}