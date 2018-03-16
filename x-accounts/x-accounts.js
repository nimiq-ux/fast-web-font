import XElement from '/libraries/x-element/x-element.js';
import XAccount from './x-account.js';

export default class XAccounts extends XElement {
    html() {
        return `
            <x-accounts-list></x-accounts-list>
            <button>Create Account</button>
        `
    }

    onCreate() {
        this._accounts = new Map();
        this.$accountsList = this.$('x-accounts-list');
        this.$('button').addEventListener('click', e => this._onCreateAccount());
    }

    /**
     * @param {array} accounts: Array of account objects
     */
    set accounts(accounts) {

        accounts.forEach(account => {
            // const [storedAccount, accountElement] = this._accounts.get(account.address);
            const stored = this._accounts.get(account.address);

            if (!stored) {
                this._accounts.set(account.address, [account, this._createAccount(account)]);
                return;
            }

            const [storedAccount, accountElement] = stored;

            // Check if properties changed
            for(const prop in account) {
                if (storedAccount[prop] !== account[prop]) {
                    // Update display
                    accountElement[prop] = account[prop];
                    // Update stored account
                    storedAccount[prop] = account[prop];
                }
            }
        });

        // TODO: Remove unpassed accounts
    }

    /**
     * @param {object} account
     */
    addAccount(account) {
        this._accounts.set(account.address, [account, this._createAccount(account)]);
        // this.accounts = [...Array.from(this._accounts.values()).map(i => i[0]), account];
    }

    _createAccount(account) {
        const $account = XAccount.createElement();

        $account.label = account.label;
        $account.address = account.address || account.number;
        $account.balance = account.balance;
        $account.secure = account.secure;

        this.$accountsList.appendChild($account.$el);

        return $account;
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }
}
