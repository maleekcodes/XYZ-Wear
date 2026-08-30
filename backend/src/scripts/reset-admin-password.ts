import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function resetAdminPassword({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const auth = container.resolve(Modules.AUTH)
  const userModule = container.resolve(Modules.USER)

  const email = process.env.MEDUSA_ADMIN_EMAIL
  const password = process.env.MEDUSA_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      "Set MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD in backend/.env"
    )
  }

  const [user] = await userModule.listUsers({ email })
  if (!user) {
    throw new Error(`No admin user found for ${email}`)
  }

  const identities = await auth.listAuthIdentities(
    {
      provider_identities: {
        entity_id: email,
        provider: "emailpass",
      },
    },
    { relations: ["provider_identities"] }
  )

  if (!identities.length) {
    const { authIdentity, error } = await auth.register("emailpass", {
      body: { email, password },
    })
    if (error || !authIdentity) {
      throw new Error(error || "Failed to register emailpass identity")
    }
    await auth.updateAuthIdentities({
      id: authIdentity.id,
      app_metadata: { user_id: user.id },
    })
    logger.info(`Created emailpass identity for ${email}`)
  } else {
    const { error } = await auth.updateProvider("emailpass", {
      entity_id: email,
      password,
    })
    if (error) {
      throw new Error(error)
    }

    const identity = identities[0]
    if (identity.app_metadata?.user_id !== user.id) {
      await auth.updateAuthIdentities({
        id: identity.id,
        app_metadata: { ...identity.app_metadata, user_id: user.id },
      })
    }
    logger.info(`Reset password for ${email}`)
  }

  const check = await auth.authenticate("emailpass", {
    body: { email, password },
  })
  if (check.error || !check.success) {
    throw new Error(check.error || "Password reset did not authenticate")
  }
  logger.info("Login verified")
}
