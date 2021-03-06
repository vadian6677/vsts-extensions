import * as React from "react";

import { Loading } from "Library/Components/Loading";
import { getAsyncLoadedComponent } from "Library/Components/Utilities/AsyncLoadedComponent";
import { isNullOrEmpty, stringEquals } from "Library/Utilities/String";
import * as WorkItemFormHelpers from "Library/Utilities/WorkItemFormHelpers";
import { IIconProps } from "OfficeFabric/Icon";
import { autobind } from "OfficeFabric/Utilities";
import * as ActionRenderers_Async from "OneClick/Components/ActionRenderers";
import { CoreFieldRefNames } from "OneClick/Constants";
import { BaseAction } from "OneClick/RuleActions/BaseAction";

const AsyncRichEditor = getAsyncLoadedComponent(
    ["scripts/ActionRenderers"],
    (m: typeof ActionRenderers_Async) => m.RichEditor,
    () => <Loading />);

export class AddCommentAction extends BaseAction {
    public async run() {
        await WorkItemFormHelpers.setWorkItemFieldValue(CoreFieldRefNames.History, this.getAttribute<string>("comment", true) || "");
    }

    public getFriendlyName(): string {
        return "Add a comment";
    }

    public getDescription(): string {
        return "Adds a comment in work item discussion";
    }

    public isValid(): boolean {
        return !isNullOrEmpty(this.getAttribute<string>("comment"));
    }

    public isDirty(): boolean {
        return super.isDirty() || !stringEquals(this.getAttribute<string>("comment", true), this.getAttribute<string>("comment"), true);
    }

    public getIcon(): IIconProps {
        return {
            iconName: "CommentAdd",
            styles: {
                root: {color: "#EA4300 !important"}
            }
        };
    }

    public render(): React.ReactNode {
        const richEditorOptions = {
            svgPath: `${VSS.getExtensionContext().baseUri}/3rdParty/icons.png`,
            btns: [
                ["bold", "italic"],
                ["link"],
                ["upload"],
                ["removeformat"],
                ["fullscreen"]
            ]
        };

        return (
            <div>
                <AsyncRichEditor
                    className="action-property-control"
                    value={this.getAttribute<string>("comment")}
                    label="Comment"
                    info="Enter comment"
                    delay={200}
                    editorOptions={richEditorOptions}
                    onChange={this._onCommentChange}
                />
            </div>
        );
    }

    protected defaultAttributes(): IDictionaryStringTo<any> {
        return {
            comment: ""
        };
    }

    @autobind
    private _onCommentChange(value: string) {
        this.setAttribute<string>("comment", value);
    }
}
