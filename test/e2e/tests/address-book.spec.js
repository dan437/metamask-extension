const { strict: assert } = require('assert');
const { By, Key, until } = require('selenium-webdriver');
const { withFixtures } = require('../helpers');

describe('Address Book', function () {
  const ganacheOptions = {
    accounts: [
      {
        secretKey:
          '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC',
        balance: 25000000000000000000,
      },
    ],
  };
  it('Adds an entry to the address book and sends eth to that address', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: 'imported-account',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        const passwordField = await driver.findElement(By.css('#password'));
        await passwordField.sendKeys('correct horse battery staple');
        await passwordField.sendKeys(Key.ENTER);

        await driver.clickElement(By.css('[data-testid="eth-overview-send"]'));

        const inputAddress = await driver.findElement(
          By.css('input[placeholder="Search, public address (0x), or ENS"]'),
        );
        await inputAddress.sendKeys(
          '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        );

        await driver.clickElement(
          By.css('.dialog.send__dialog.dialog--message'),
        );

        const addressBookAddModal = await driver.findElement(
          By.css('span .modal'),
        );
        await driver.findElement(By.css('.add-to-address-book-modal'));
        const addressBookInput = await driver.findElement(
          By.css('.add-to-address-book-modal__input'),
        );
        await addressBookInput.sendKeys('Test Name 1');
        await driver.clickElement(
          By.css('.add-to-address-book-modal__footer .btn-primary'),
        );
        await driver.wait(until.stalenessOf(addressBookAddModal));

        const inputAmount = await driver.findElement(
          By.css('.unit-input__input'),
        );
        await inputAmount.sendKeys('1');

        const inputValue = await inputAmount.getAttribute('value');
        assert.equal(inputValue, '1');

        await driver.clickElement(
          By.xpath(`//button[contains(text(), 'Next')]`),
        );

        await driver.clickElement(
          By.xpath(`//button[contains(text(), 'Confirm')]`),
        );

        await driver.clickElement(By.css('[data-testid="home__activity-tab"]'));
        await driver.wait(async () => {
          const confirmedTxes = await driver.findElements(
            By.css(
              '.transaction-list__completed-transactions .transaction-list-item',
            ),
          );
          return confirmedTxes.length === 1;
        }, 10000);

        const txValues = await driver.findElement(
          By.css('.transaction-list-item__primary-currency'),
        );
        await driver.wait(
          until.elementTextMatches(txValues, /-1\s*ETH/u),
          10000,
        );
      },
    );
  });
  it('Sends to an address book entry', async function () {
    await withFixtures(
      {
        fixtures: 'address-entry',
        ganacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        const passwordField = await driver.findElement(By.css('#password'));
        await passwordField.sendKeys('correct horse battery staple');
        await passwordField.sendKeys(Key.ENTER);

        await driver.clickElement(By.css('[data-testid="eth-overview-send"]'));
        const recipientRowTitle = await driver.findElement(
          By.css('.send__select-recipient-wrapper__group-item__title'),
        );
        const recipientRowTitleString = await recipientRowTitle.getText();
        assert.equal(recipientRowTitleString, 'Test Name 1');
        await driver.clickElement(
          By.css('.send__select-recipient-wrapper__group-item'),
        );

        const inputAmount = await driver.findElement(
          By.css('.unit-input__input'),
        );
        await inputAmount.sendKeys('2');

        await driver.clickElement(
          By.xpath(`//button[contains(text(), 'Next')]`),
        );

        await driver.clickElement(
          By.xpath(`//button[contains(text(), 'Confirm')]`),
        );

        await driver.clickElement(By.css('[data-testid="home__activity-tab"]'));
        await driver.wait(async () => {
          const confirmedTxes = await driver.findElements(
            By.css(
              '.transaction-list__completed-transactions .transaction-list-item',
            ),
          );
          return confirmedTxes.length === 1;
        }, 10000);

        const txValues = await driver.findElement(
          By.css('.transaction-list-item__primary-currency'),
        );
        await driver.wait(
          until.elementTextMatches(txValues, /-2\s*ETH/u),
          10000,
        );
      },
    );
  });
});
