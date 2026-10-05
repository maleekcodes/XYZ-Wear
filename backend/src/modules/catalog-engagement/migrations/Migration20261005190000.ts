import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261005190000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "catalog_subscription" drop constraint if exists "catalog_subscription_kind_check";`
    )
    this.addSql(
      `alter table "catalog_subscription" add constraint "catalog_subscription_kind_check" check ("kind" in ('waitlist', 'restock', 'launch'));`
    )
    this.addSql(
      `alter table "catalog_subscription" drop constraint if exists "catalog_subscription_source_check";`
    )
    this.addSql(
      `alter table "catalog_subscription" add constraint "catalog_subscription_source_check" check ("source" in ('physical', 'digital', 'homepage'));`
    )
    this.addSql(
      `alter table "catalog_subscription" alter column "product_id" drop not null;`
    )
  }
}
