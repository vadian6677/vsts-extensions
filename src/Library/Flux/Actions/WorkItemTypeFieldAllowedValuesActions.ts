import { WorkItemTypeFieldAllowedValuesActionsHub } from "Library/Flux/Actions/ActionsHub";
import { StoreFactory } from "Library/Flux/Stores/BaseStore";
import {
    WorkItemTypeFieldAllowedValuesStore
} from "Library/Flux/Stores/WorkItemTypeFieldAllowedValuesStore";
import { WorkItemTypeFieldsExpandLevel } from "TFS/WorkItemTracking/Contracts";
import * as WitClient from "TFS/WorkItemTracking/RestClient";

export namespace WorkItemTypeFieldAllowedValuesActions {
    const workItemTypeFieldStore: WorkItemTypeFieldAllowedValuesStore = StoreFactory.getInstance<WorkItemTypeFieldAllowedValuesStore>(WorkItemTypeFieldAllowedValuesStore);

    export async function initializeAllowedValues(workItemType: string, fieldRefName: string) {
        const key = `${workItemType}_${fieldRefName}`;

        if (workItemTypeFieldStore.isLoaded(key)) {
            WorkItemTypeFieldAllowedValuesActionsHub.InitializeAllowedValues.invoke(null);
        }
        else if (!workItemTypeFieldStore.isLoading(key)) {
            workItemTypeFieldStore.setLoading(true, key);
            try {
                const workItemTypeField = await WitClient.getClient().getWorkItemTypeFieldWithReferences(VSS.getWebContext().project.id, workItemType, fieldRefName, WorkItemTypeFieldsExpandLevel.AllowedValues);

                WorkItemTypeFieldAllowedValuesActionsHub.InitializeAllowedValues.invoke({
                    workItemType: workItemType,
                    fieldRefName: fieldRefName,
                    allowedValues: workItemTypeField.allowedValues || []
                });
                workItemTypeFieldStore.setLoading(false, key);
            }
            catch (e) {
                WorkItemTypeFieldAllowedValuesActionsHub.InitializeAllowedValues.invoke({
                    workItemType: workItemType,
                    fieldRefName: fieldRefName,
                    allowedValues: []
                });
                workItemTypeFieldStore.setLoading(false, key);
            }
        }
    }
}
