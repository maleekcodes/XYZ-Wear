# xyzwear.co DNS repair

Observed on 30 September 2026 from both authoritative Namecheap nameservers:

| Host | Current record | Value |
| --- | --- | --- |
| `@` | CNAME | `wc5uw6i7.up.railway.app` |
| `@` | MX | `mx1-hosting.jellyfish.systems` (priority 5), `mx2-hosting.jellyfish.systems` (10), `mx3-hosting.jellyfish.systems` (20) |
| `@` | TXT | SPF record present |
| `www` | CNAME | `szxsbcnd.up.railway.app` |

The root CNAME shares a DNS name with MX, TXT, NS and SOA records. Namecheap says its ALIAS record can coexist with these records and is suitable at the root. Railway accepts dynamic ALIAS records for root domains. Some resolvers may reject the current conflicting configuration, although an intermittent outage cannot be attributed to DNS alone without an affected resolver's response.

## Change in Namecheap Advanced DNS

1. Replace only the `@` CNAME with an `@` ALIAS whose value is `wc5uw6i7.up.railway.app`. Use the existing TTL or Namecheap's automatic setting.
2. Keep the `www` CNAME, MX, SPF/TXT, mail verification, and other records unchanged.
3. Confirm Railway still lists `xyzwear.co` as a valid custom domain for the storefront service.

## Verify after propagation

Query both authoritative nameservers and several recursive resolvers for `xyzwear.co` A, CNAME, MX, TXT and `www.xyzwear.co` A. The root must return address records without a root CNAME, while MX/TXT stay intact. Confirm HTTPS loads both hostnames and that Railway reports the root domain and certificate as valid. Recheck from the affected internet provider.

If Railway validation fails, restore the previous root CNAME while investigating. That rollback restores the previous availability but also restores the DNS conflict.

References: [Namecheap ALIAS guidance](https://www.namecheap.com/support/knowledgebase/article.aspx/579/2237/which-record-type-option-should-i-choose-for-the-information-im-about-to-enter/), [Railway root-domain guidance](https://docs.railway.com/networking/domains/working-with-domains).
