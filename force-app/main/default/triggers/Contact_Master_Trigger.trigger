trigger Contact_Master_Trigger on Contact_Master__c (before insert, before update) {
    MarketingCloudTriggerHandler.onContactMaster(Trigger.new, Trigger.old);
}