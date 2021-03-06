import { TeamActionsHub } from "Library/Flux/Actions/ActionsHub";
import { StoreFactory } from "Library/Flux/Stores/BaseStore";
import { TeamStore } from "Library/Flux/Stores/TeamStore";
import { localeIgnoreCaseComparer } from "Library/Utilities/String";
import { WebApiTeam } from "TFS/Core/Contracts";
import * as CoreClient from "TFS/Core/RestClient";

export namespace TeamActions {
    const teamStore: TeamStore = StoreFactory.getInstance<TeamStore>(TeamStore);

    export async function initializeTeams() {
        if (teamStore.isLoaded()) {
            TeamActionsHub.InitializeTeams.invoke(null);
        }
        else if (!teamStore.isLoading()) {
            teamStore.setLoading(true);
            try {
                const teams = await getTeams();
                teams.sort((a: WebApiTeam, b: WebApiTeam) => localeIgnoreCaseComparer(a.name, b.name));
                TeamActionsHub.InitializeTeams.invoke(teams);
                teamStore.setLoading(false);
            }
            catch (e) {
                teamStore.setLoading(false);
                throw e.message;
            }
        }
    }

    async function getTeams(): Promise<WebApiTeam[]> {
        const teams: WebApiTeam[] = [];
        const top: number = 300;
        const client = CoreClient.getClient();
        const project = VSS.getWebContext().project.id;

        const getTeamDelegate = async (skip: number) => {
            const result: WebApiTeam[] = await client.getTeams(project, false, top, skip);
            if (result.length > 0) {
                teams.push(...result);
            }
            if (result.length === top) {
                await getTeamDelegate(skip + top);
            }
            return;
        };

        await getTeamDelegate(0);
        return teams;
    }
}
