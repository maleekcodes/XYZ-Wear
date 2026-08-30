import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function listAdminUsers({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const userModule = container.resolve(Modules.USER)
  const users = await userModule.listUsers({}, { take: 50 })
  logger.info(`Admin users (${users.length}):`)
  for (const user of users) {
    logger.info(`- ${user.email} (${user.id})`)
  }
}
