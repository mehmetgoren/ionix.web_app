import { GetterTree } from 'vuex';
import { IState } from '../index';
import { ISettingsState, LoadingInfo, MenuLink, MenuObject } from './state';
import { User } from 'src/utils/models/user_model';
import { LocalService } from 'src/utils/services/local_service';

const getters: GetterTree<ISettingsState, IState> = {
  dense(state : ISettingsState): boolean {
    return state.dense;
  },
  menu(state : ISettingsState): MenuObject {
    return state.menu;
  },
  cameras(state: ISettingsState): MenuLink[]{
    return state.menu['node']['cameras'];
  },
  activeLeftMenu(state : ISettingsState): MenuLink | null {
    return state.activeLeftMenu;
  },
  sourceLoading(state : ISettingsState): LoadingInfo {
    return state.sourceLoading;
  },
  addSourceClicked(state: ISettingsState): boolean{
    return state.addSourceClicked;
  },
  sourceStreamStatusChanged(state: ISettingsState): boolean{
    return state.sourceStreamStatusChanged;
  },
  aiSettingsClicked(state: ISettingsState): boolean{
    return state.aiSettingsClicked;
  },
  aiSettingsSourceId(state: ISettingsState): string{
    return state.aiSettingsSourceId;
  },
  currentUser(state: ISettingsState): User | null{
    let user = state.currentUser;
    if (!user){
      user = new LocalService().getCurrentUser();
    }
    return user;
  }
};

export default getters;
