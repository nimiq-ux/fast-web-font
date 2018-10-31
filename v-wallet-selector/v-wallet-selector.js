import XElement from '/libraries/x-element/x-element.js'
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js'
import { switchWallet } from '/apps/safe/src/wallet-redux.js'
import ReduxProvider from '../node_modules/vuejs-redux/bundle.es.js'
import { walletsArray$, activeWalletId$, activeWallet$ } from '/apps/safe/src/selectors/wallet$.js'
import accountManager from '/apps/safe/src/account-manager.js'

export default class VWalletSelector extends MixinRedux(XElement) {
    html() {
        return `
            <div active-wallet-label></div>
            <div class="v-wallet-menu display-none" id="vue-wallet-menu">
                <!-- Vue template -->
                <redux-provider :map-state-to-props="mapStateToProps" :store="store">
                    <login-menu
                        slot-scope="{wallets, activeWalletId}"
                        :logins="wallets"
                        :active-login-id="activeWalletId"
                        @login-selected="walletSelected"
                        @rename-login="renameWallet"
                        @export-login="exportWallet"
                        @logout-login="logoutWallet"
                        @create="create"
                        @login="login"
                    ></login-menu>
                </redux-provider>
                <!-- End Vue template -->
            </div>
        `
    }

    static get actions() {
        return {
            switchWallet,
        }
    }

    listeners() {
        return {
            'click [active-wallet-label]': () => this._toggleMenu(),
        }
    }

    static mapStateToProps(state, props) {
        return {
            activeWallet: activeWallet$(state),
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.activeWallet) {
            this.$('[active-wallet-label]').textContent = changes.activeWallet.label + ' ▼'
        }
    }

    onCreate() {
        super.onCreate()
        const self = this

        this._documentListener = this.__documentListener.bind(this)
        this._isMenuActive = false

        this.vue = new Vue({
            el: '#vue-wallet-menu',
            data: {
                store: MixinRedux.store
            },
            methods: {
                mapStateToProps(state) {
                    const wallets = walletsArray$(state).map(wallet => {
                        return Object.assign({}, wallet, {
                            addresses: new Map(new Array(wallet.numberAccounts).fill(0).map((_, i) => [i.toString(), 'dummy'])),
                            contracts: [],
                        })
                    })
                    return {
                        wallets,
                        activeWalletId: activeWalletId$(state),
                    }
                },
                walletSelected(keyId) {
                    self.actions.switchWallet(keyId)
                    self._hideMenu()
                },
                renameWallet(keyId) {
                    alert("Renaming wallets is not yet available.")
                    self._hideMenu()
                },
                exportWallet(keyId) {
                    accountManager.exportWords(keyId)
                    self._hideMenu()
                },
                logoutWallet(keyId) {
                    accountManager.logout(keyId)
                    self._hideMenu()
                },
                create() {
                    accountManager.create()
                    self._hideMenu()
                },
                login() {
                    accountManager.login()
                    self._hideMenu()
                },
            },
            components: {
                'redux-provider': ReduxProvider,
                'login-menu': NimiqVueComponents.LoginMenu,
            }
        })
    }

    _toggleMenu() {
        if (this._isMenuActive) return this._hideMenu()

        this.$el.classList.add('menu-active')
        this.$('#vue-wallet-menu').classList.remove('display-none')
        this._isMenuActive = true

        document.addEventListener('click', this._documentListener)
    }

    _hideMenu() {
        this.$el.classList.remove('menu-active')
        this.$('#vue-wallet-menu').classList.add('display-none')
        this._isMenuActive = false

        document.removeEventListener('click', this._documentListener)
    }

    __documentListener(event) {
        if (event.target.matches('v-wallet-selector, v-wallet-selector *')) return
        this._hideMenu()
    }
}