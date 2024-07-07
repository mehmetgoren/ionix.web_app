<template>
  <q-layout view='hHh lpR fFf' class='bg-grey-1'>
    <q-header elevated class='bg-white text-grey-8'>
      <q-toolbar class='GNL__toolbar'>
        <q-toolbar-title shrink class='row items-center no-wrap'>
          <q-img src='../../public/icons/logo.png' style="cursor: pointer; width: 60px;" @click='toggleLeftDrawer'/>
        </q-toolbar-title>
        <ServerStatsBar/>
        <q-space/>
        <!--  left panel panel-->
        <div class='q-gutter-sm row items-center no-wrap'>
          <q-btn flat round dense icon='widgets' >
            <q-tooltip>{{ $t('open_ui_config') }}</q-tooltip>
            <q-popup-proxy v-model="showUiSettings">
              <UiConfig @on-save="onUiConfigSave" />
            </q-popup-proxy>
          </q-btn>
          <Notifier style="margin-right: -8px"/>
          <q-btn-dropdown icon='account_circle' round flat :label='currentUser?.username' v-model="showRightDropDown">
            <q-list>
              <q-item clickable>
                <q-select v-model="locale" :options="localeOptions" :label="$t('language')"
                          square dense borderless emit-value map-options options-dense style="min-width: 150px">
                  <template v-slot:prepend>
                    <q-img :src="getImgSrc()" width="30px"/>
                  </template>
                </q-select>
              </q-item>
              <q-item clickable v-close-popup>
                <q-toggle style="margin-left: -12px;" v-model="theme" color="dark" checked-icon="dark_mode" unchecked-icon="light_mode"
                          :label="(theme ? $t('dark_theme') : $t('light_theme'))"/>
              </q-item>
              <q-item clickable v-close-popup @click='onLogoutUser'>
                <q-item-section>
                  <q-item-label>
                    <q-avatar size='36px'>
                      <q-icon name='logout'/>
                    </q-avatar>
                    {{ $t('logout') }}
                    <q-tooltip>{{ $t('dlogout') }}</q-tooltip>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

      </q-toolbar>
    </q-header>

    <q-drawer v-model='leftDrawerOpen' show-if-above bordered class='bg-white' :width='265'>
      <q-scroll-area class="fit">
        <q-list padding class='text-grey-8'>
          <div v-for='(menu, index) in menus' :key='index'>
            <q-item v-for='link in menu' :key='link.text' class='GNL__drawer-item'
                    :active='!link.isSource&&link.name&&activeLeftMenu===link.name' active-class='my-menu-link'>
              <q-item-section avatar v-if='!link.isSource' style='cursor: pointer;' v-ripple @click='onLeftMenuClick(link)'>
                <q-icon v-if='!link.isSource' :name='link.icon'/>
              </q-item-section>
              <q-item-section v-if='!link.isSource' style='cursor: pointer;' v-ripple @click='onLeftMenuClick(link)'>
                <q-item-label>{{ link.text }}</q-item-label>
              </q-item-section>
              <q-item-section v-if='link.isSource' :class="{'disabled':sourceStreamStatus[link.id]&&!sourceStreamStatus[link.id].enabled}">
                <q-img :src="'data:image/png;base64, ' + (link.thumbnail ? link.thumbnail : emptyBase64Image)" spinner-color='white'
                       style='height: 80px; width: 200px; cursor: pointer;' class="shadow-2">
                  <div class='absolute-bottom text-subtitle1 three-dots'>
                    <q-icon v-if='sourceStreamStatus[link.id]&&sourceStreamStatus[link.id].streaming' name='live_tv' color='green'
                            style='margin-right: 3px;'
                            class='blink_me'/>
                    <q-icon v-if='sourceStreamStatus[link.id]&&sourceStreamStatus[link.id].recording' name='fiber_manual_record' color='red'
                            style='margin-right: 3px;' class='blink_me'/>
                    <q-icon :name='link.icon'/>
                    <span style="margin-left: 5px;">{{ link.text }}</span>
                  </div>
                  <q-inner-loading v-if='loadingObject[link.id]' :showing='true' :label="$t('please_wait')" label-class='text-cyan'
                                   label-style='font-size: 1.1em'>
                    <q-spinner-hourglass size='75%' color='cyan'/>
                  </q-inner-loading>
                </q-img>
              </q-item-section>
              <q-btn-dropdown v-if='link.isSource' color='primary' dropdown-icon='settings' :dense='true' square>
                <q-list>
                  <q-item clickable v-close-popup @click='onStartStreaming(link)' v-ripple
                          :disable="sourceStreamStatus[link.id]&&!sourceStreamStatus[link.id].enabled">
                    <q-item-section side>
                      <q-icon name='live_tv' color='cyan'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('start_streaming') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onStopStreaming(link)' v-ripple
                          :disable="sourceStreamStatus[link.id]&&!sourceStreamStatus[link.id].enabled">
                    <q-item-section side>
                      <q-icon name='power_off' color='deep-orange'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('stop_streaming') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onSaveSettingsClicked(link.id)' v-ripple>
                    <q-item-section side>
                      <q-icon name='settings' color='cyan'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('settings') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onShowRecordClicked(link.id)'>
                    <q-item-section side>
                      <q-icon name='dvr' color='purple'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('playback') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onAiClick(link.id)'>
                    <q-item-section side>
                      <q-icon name='auto_awesome' color='orange'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('ai') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click='onTakeScreenshotClicked(link)'>
                    <q-item-section side>
                      <q-icon name='photo_camera' color='purple'/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('take_screenshot') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-item clickable v-close-popup @click='getThumbnail(link.source)'>
                  <q-item-section side>
                    <q-icon name='center_focus_strong' color='purple'/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('test') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <!--                <q-inner-loading v-if='loadingObject[link.id]' :showing='true'>-->
                <!--                  <q-spinner-gears size='50px' color='primary' />-->
                <!--                </q-inner-loading>-->
              </q-btn-dropdown>
            </q-item>
            <q-separator v-if='menu.length' inset class='q-my-sm'/>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <div id="main-view" :style="{height:mainViewHeight.toString() + 'px'}">
        <router-view/>
      </div>
    </q-page-container>
  </q-layout>

  <q-dialog v-model='showSettings' full-width full-height transition-show='flip-down' transition-hide='flip-up'>
    <SourceSettings :source-id='selectedSourceId' @on-save='onSourceSettingsSave' @on-delete='onSourceDelete'/>
  </q-dialog>

</template>

<script lang='ts'>
import {onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {NodeService} from 'src/utils/services/node_service';
import {LoadingInfo, MenuLink, StreamCommandBarActions, StreamCommandBarInfo} from 'src/store/module-settings/state';
import {PublishService, SubscribeService} from 'src/utils/services/websocket_services';
import {EditorImageResponseModel} from 'src/utils/entities';
import SourceSettings from 'components/SourceSettings.vue';
import ServerStatsBar from 'components/ServerStatsBar.vue';
import {SourceModel} from 'src/utils/models/source_model';
import {
  createEmptyBase64Image, doUserLogout, getImageSrc, listenWindowSizeChangesForScrollBar, scrollbarInit,
  setupLocale, startStream, stopStream
} from 'src/utils/utils';
import {StoreService} from 'src/utils/services/store_service';
import {WsConnection} from 'src/utils/ws/connection';
import Notifier from 'components/Notifier.vue';
import {useI18n} from 'vue-i18n';
import {useQuasar} from 'quasar';
import {auto as followSystemColorScheme, disable as disableDarkMode, enable as enableDarkMode, exportGeneratedCSS as collectCSS} from 'darkreader';
import {Themes} from 'src/utils/services/local_service';
import UiConfig from 'components/UiConfig.vue';

export default {
  name: 'Ionix Layout',
  components: {
    UiConfig,
    SourceSettings,
    ServerStatsBar, Notifier
  },
  setup() {
    const {locale, t} = useI18n({useScope: 'global'});
    const storeService = new StoreService();
    const nodeService = new NodeService();
    const localService = nodeService.LocalService;
    const gls = localService.createGalleryLocationService();
    const $q = useQuasar();
    setupLocale(localService, locale, $q);
    storeService.set18n(t);
    const router = useRouter();
    const route = useRoute();
    const leftDrawerOpen = ref(false);
    const publishService = new PublishService();
    const loadingObject = reactive<any>({});
    const sourceStreamStatus = reactive<any>({});
    const showSettings = ref<boolean>(false);
    const selectedSourceId = ref<string>('');
    const emptyBase64Image = ref<string>(createEmptyBase64Image());
    const activeLeftMenu = ref<string>('config');
    const selectedSourceAddress = ref<string>('');
    const menus = ref(storeService.getNode());
    const mainViewHeight = ref<number>(window.innerHeight);
    const theme = ref<boolean>(false);
    const showRightDropDown = ref<boolean>(false);
    let editorConnection: WsConnection | null = null;
    let sourceStatusInterval: NodeJS.Timer | null = null;
    const showUiSettings = ref<boolean>(false);

    const loadSources = async () => {
      const sources = await nodeService.getSourceList();
      for (const source of sources) {
        storeService.addSourceToLeftMenu(source);
        setTimeout(() => {
          _getThumbnail(source);
        });
        loadingObject[<string>source.id] = false;
      }
    };

    async function sourceStreamDatabind() {
      const sourceStreamStatusList = await nodeService.getSourceStreamStatus();
      for (const item of sourceStreamStatusList) {
        sourceStreamStatus[item.id] = item;
      }
    }

    const sourceLoading = storeService.sourceLoading;
    watch(sourceLoading, (obj: LoadingInfo) => {
      loadingObject[obj.id] = obj.loading;
    });

    const sourceStreamStatusChanged = storeService.sourceStreamStatusChanged;
    watch(sourceStreamStatusChanged, async () => {
      await sourceStreamDatabind();
    });

    const clickedStreamCommandBar = storeService.clickedStreamCommandBar;
    watch(clickedStreamCommandBar, (info: StreamCommandBarInfo) => {
      switch (info.action) {
        case  StreamCommandBarActions.ShowSourceSettings:
          selectedSourceId.value = info.source.id;
          showSettings.value = true;
          break;
        case StreamCommandBarActions.CloseSourceSettings:
          selectedSourceId.value = info.source.id;
          showSettings.value = false;
          break;
      }
    });

    watch(theme, (darkTheme: boolean) => {
      if (darkTheme) {
        //@ts-ignore
        enableDarkMode();
        localService.saveTheme(Themes.Dark);
      } else {
        disableDarkMode();
        localService.saveTheme(Themes.Light);
      }
      showRightDropDown.value = false;
    });

    const constInitDarkTheme = async () => {
      //@ts-ignore
      followSystemColorScheme(true);
      await collectCSS();

      if (localService.getTheme() == Themes.Dark) {
        //@ts-ignore
        enableDarkMode();
        theme.value = true;
      } else {
        disableDarkMode();
        theme.value = false;
      }
    };

    watch(locale, lang => {
      locale.value = lang;
      localService.setLang(<any>lang);
      storeService.set18n(t);
      showRightDropDown.value = false;
      // setTimeout(() => {
      //   window.location.reload();
      // }, 100);
    });

    onMounted(async () => {
      scrollbarInit('main-view');
      listenWindowSizeChangesForScrollBar(mainViewHeight);
      const currentPath = route.path;
      if (currentPath) {
        activeLeftMenu.value = currentPath.replace('/', '');
      }
      const subscribeService = new SubscribeService();
      editorConnection = subscribeService.subscribeEditor('ml', (event: MessageEvent) => {
        const responseModel: EditorImageResponseModel = JSON.parse(event.data);
        switch (responseModel.event_type) {
          case 1:
            window.location.href = 'data:application/octet-stream;base64,' + responseModel.image_base64;
            break
          case 2:
            storeService.setSourceThumbnail(responseModel);
            localService.saveThumbnail(responseModel.id ?? '', responseModel.image_base64);
            break
        }
        storeService.setSourceLoading(<string>responseModel.id, false);
      });

      sourceStatusInterval = setInterval(() => {
        void sourceStreamDatabind();
      }, 30000);

      await loadSources();
      await sourceStreamDatabind();
      await constInitDarkTheme();
    });

    onBeforeUnmount(() => {
      try{
        editorConnection?.close();
      }finally {
        if (sourceStatusInterval) {
          clearInterval(sourceStatusInterval);
        }
      }
    });

    const currentUser = storeService.currentUser;

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function _getThumbnail(source: SourceModel) {
      const thumbnail = localService.getThumbnail(source.id ?? '');
      if (thumbnail) {
        storeService.setSourceThumbnail({
          id: source.id,
          name: source.name,
          brand: source.brand,
          address: source.address,
          event_type: 2,
          image_base64: thumbnail
        });
      } else {
        getThumbnail(source);
      }
    }

    function getThumbnail(source: SourceModel) {
      publishService.publishEditor({
        id: source.id,
        brand: source.brand,
        name: source.name,
        address: source.address,
        event_type: 2
      }).then().catch(console.error);
      const sourceId = <string>source.id;
      storeService.setSourceLoading(sourceId, true);
      setTimeout(() => {
        storeService.setSourceLoading(sourceId, false);
      }, 30000);
    }

    const onShowRecordClicked = (sourceId: string) => {
      storeService.setRecordSourceId(sourceId);
      void router.push('source_records');
    }

    const onAiClick = (sourceId: string) => {
      storeService.setAiSettingsSourceId(sourceId);
      void router.push('ai_settings');
    };

    const onLogoutUser = async () => {
      await nodeService.logoutUser(currentUser.value);
      await doUserLogout(nodeService.LocalService, storeService, router);
    };

    return {
      leftDrawerOpen, menus, currentUser, loadingObject, sourceStreamStatus, showSettings, selectedSourceId, emptyBase64Image,
      activeLeftMenu, selectedSourceAddress, mainViewHeight, theme, showRightDropDown, locale, showUiSettings,
      localeOptions: [
        {value: 'ar', label: 'العربية'},
        {value: 'en-US', label: 'English'},
        {value: 'tr-TR', label: 'Türkçe'}
      ],
      toggleLeftDrawer, getThumbnail, onShowRecordClicked, onAiClick, onLogoutUser,
      onSaveSettingsClicked(sourceId: string) {
        showSettings.value = true;
        selectedSourceId.value = sourceId;
      },
      onStartStreaming(link: MenuLink) {
        startStream(storeService, publishService, gls, <SourceModel>link.source);
      },
      onStopStreaming(link: MenuLink) {
        stopStream(storeService, publishService, gls, <SourceModel>link.source);
      },
      onTakeScreenshotClicked(link: MenuLink) {
        const source = <SourceModel>link.source;
        void publishService.publishEditor({
          id: source.id,
          brand: source.brand,
          name: source.name,
          address: source.ms_address,
          event_type: 1
        });
        storeService.setSourceLoading(<string>source.id, true);
      },
      onSourceSettingsSave() {
        showSettings.value = false;
        storeService.setStreamCommandBar({
          source: {id: selectedSourceId, address: selectedSourceAddress},
          action: StreamCommandBarActions.SaveSource
        });
      },
      onSourceDelete() {
        showSettings.value = false;
        storeService.setStreamCommandBar({
          source: {id: selectedSourceId, address: selectedSourceAddress},
          action: StreamCommandBarActions.DeleteSource
        });
      },
      getImgSrc() {
        return getImageSrc(locale);
      },
      onUiConfigSave() {
        showUiSettings.value = false;
        window.location.reload();
      },
    };
  },
  methods: {
    onLeftMenuClick(link: MenuLink) {
      //@ts-ignore
      this.activeLeftMenu = link.name;
      const me: any = this;
      if (link.route) {
        if (link.route === 'add_source') {
          //@ts-ignore
          this.selectedSourceId = '';
          //@ts-ignore
          this.showSettings = true;
        } else {
          me.$store.commit('settings/setActiveLeftMenu', link);
          me.$router.push(link.route);
        }
      } else if (link.href) {
        window.open(link.href, '_blank');
      }
    }
  }
};
</script>

<style lang='sass'>
.GNL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 55%

  &__drawer-item
    line-height: 14px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      .q-icon
        color: #5f6368

    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

    &:hover
      color: #000
</style>

<style scoped>
.blink_me {
  animation: blinker 1s linear infinite;
  color: red;
  font-size: medium;
}

.my-menu-link {
  color: white;
  background: whitesmoke;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.three-dots {
  display: inline-block;
  width: 200px;
  white-space: nowrap;
  overflow: hidden !important;
  text-overflow: ellipsis;
}
</style>
