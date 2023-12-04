# circus-barker
 Take advantage of CF cache to save trips (to our origin low-power raspi).
 In addition, attempt A/B with one tunnel and the device pair (raspi + spare).


see CF examples
- developers.cloudflare.com/pages/platform/functions/advanced-mode/#set-up-a-function
- developers.cloudflare.com/workers/examples/modify-request-property
- developers.cloudflare.com/cloudflare-one/tutorials/many-cfd-one-tunnel

### notes
- KV free tier has a limit 1000 puts/day 
- phase i, filter del activity
- phase ii, check incoming activity against authors that we subscribed-to
- phase ii, digest and datetime


