import { Module } from "@medusajs/framework/utils"
import CatalogEngagementModuleService from "./service"

export const CATALOG_ENGAGEMENT_MODULE = "catalog_engagement"

export default Module(CATALOG_ENGAGEMENT_MODULE, {
  service: CatalogEngagementModuleService,
})
