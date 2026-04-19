import { expect, test } from '@playwright/test'

test.describe('E2E-F02 Profile edit, address CRUD, and account safety dialogs', () => {
  test('updates profile, performs address CRUD, and validates destructive confirmation dialogs', async ({ page }) => {
    let nextAddressNumber = 2
    let deleteAddressCalls = 0

    const meState = {
      id: 'user-profile-1',
      _id: 'user-profile-1',
      firstName: 'Play',
      lastName: 'Writer',
      username: 'pw_user',
      email: 'pw_user@example.com',
      phone: '01012345678',
      profilePhoto: '',
      addresses: [
        {
          _id: 'addr-1',
          address_name: 'Home',
          country: 'Egypt',
          city: 'Cairo',
          postalcode: '12345',
          street: 'Nile St',
          building: '10A',
          floor: 2,
          special_mark: 'Near the bridge',
        },
      ],
    }

    await page.addInitScript(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          token: 'playwright-token',
          id: 'user-profile-1',
          firstName: 'Play',
          lastName: 'Writer',
          username: 'pw_user',
          email: 'pw_user@example.com',
          phone: '01012345678',
        })
      )
    })

    // Fallback for any unhandled API call so auth interceptor never receives accidental 401s.
    await page.route('**/api/**', async (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
        return
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
    })

    await page.route('**/api/brands', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ brands: [] }) })
    })

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ categories: [] }) })
    })

    await page.route('**/api/cart', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })

    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(meState),
      })
    })

    await page.route('**/api/users/me/update-profile', async (route) => {
      const payload = route.request().postDataJSON()
      Object.assign(meState, payload)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(meState),
      })
    })

    await page.route('**/api/users/me/create-address', async (route) => {
      const payload = route.request().postDataJSON()
      const newAddress = {
        _id: `addr-${nextAddressNumber++}`,
        ...payload,
      }
      meState.addresses = [...meState.addresses, newAddress]

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Address added successfully.',
          addresses: meState.addresses,
        }),
      })
    })

    await page.route('**/api/users/me/addresses/*', async (route) => {
      const method = route.request().method()
      const addressId = route.request().url().split('/').pop()

      if (method === 'PATCH') {
        const fields = route.request().postDataJSON()
        meState.addresses = meState.addresses.map((address) =>
          String(address._id ?? address.id) === String(addressId)
            ? { ...address, ...fields }
            : address
        )

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Address updated successfully.',
            addresses: meState.addresses,
          }),
        })
        return
      }

      if (method === 'DELETE') {
        deleteAddressCalls += 1
        meState.addresses = meState.addresses.filter(
          (address) => String(address._id ?? address.id) !== String(addressId)
        )

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Address deleted successfully.',
            addresses: meState.addresses,
          }),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/me')

    await expect(page.getByText('Profile').first()).toBeVisible()
    await expect(page.getByText('Play Writer')).toBeVisible()

    await page.getByRole('link', { name: 'Edit profile' }).click()
    await expect(page).toHaveURL(/\/me\/edit$/)

    await page.getByLabel('First name').fill('Player')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page).toHaveURL(/\/me$/)
    await expect(page.getByText('Profile updated successfully.').first()).toBeVisible()
    await expect(page.getByText('Player Writer')).toBeVisible()

    await page.getByLabel('Add address').click()
    await expect(page.getByText('Add address')).toBeVisible()

    await page.getByLabel('Address name').fill('Office')
    await page.getByLabel('Country').fill('Egypt')
    await page.getByLabel('City').fill('Giza')
    await page.getByLabel('Postal code').fill('54321')
    await page.getByLabel('Street').fill('Pyramid St')
    await page.getByLabel('Building').fill('22B')
    await page.getByLabel('Floor').fill('5')
    await page.getByLabel('Special mark').fill('Beside the plaza')
    await page.getByRole('button', { name: 'Save address' }).click()

    await expect(page.getByText('Office')).toBeVisible()
    await expect(page.getByText('Egypt, Giza, Pyramid St 22B, floor 5')).toBeVisible()

    await page.getByLabel('Edit address').nth(1).click()
    await expect(page.getByText('Edit address')).toBeVisible()
    await page.getByLabel('City').fill('Alexandria')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText('Egypt, Alexandria, Pyramid St 22B, floor 5')).toBeVisible()

    await page.getByLabel('Delete address').nth(1).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.getByText('Confirm Delete')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.getByText('Office')).toBeVisible()
    await expect.poll(() => deleteAddressCalls).toBe(0)

    await page.getByLabel('Delete address').nth(1).click()
    await page.getByRole('button', { name: 'Delete' }).click()

    await expect.poll(() => deleteAddressCalls).toBe(1)
    await expect(page.getByText('Office')).toHaveCount(0)

    await page.getByRole('button', { name: 'Delete account' }).click()
    const deleteAccountDialog = page.getByRole('alertdialog').filter({ hasText: 'Delete Account' })
    await expect(deleteAccountDialog).toBeVisible()
    await expect(deleteAccountDialog.getByRole('heading', { name: 'Delete Account' })).toBeVisible()
    await deleteAccountDialog.getByRole('button', { name: 'Cancel' }).click()

    await expect(page).toHaveURL(/\/me$/)
    await expect(page.getByText('Player Writer')).toBeVisible()
  })
})
