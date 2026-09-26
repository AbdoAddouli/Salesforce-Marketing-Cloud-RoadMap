trigger Training_Question_Trigger on Training_Question__c (before insert, before update) {
    MarketingCloudTriggerHandler.onTrainingQuestion(Trigger.new);
}