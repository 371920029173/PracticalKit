export const ADSENSE_CLIENT = "ca-pub-4701068000566326";

export const AD_SLOTS = {
  displayPrimary: "1636590885",
  multiplexPrimary: "2770768644",
  inFeedPrimary: "2690877591",
} as const;

export const IN_FEED_LAYOUT_KEY = "-fb+5w+4e-db+86";

type SnippetSet = {
  html: string;
  amp: string;
};

function htmlSnippet({
  slot,
  format,
  extraAttrs = "",
}: {
  slot: string;
  format: string;
  extraAttrs?: string;
}): string {
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${ADSENSE_CLIENT}"
     data-ad-slot="${slot}"
     data-ad-format="${format}"${extraAttrs}></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;
}

function ampSnippet({
  slot,
  width = "100vw",
  height = "320",
  format = "rspv",
}: {
  slot: string;
  width?: string;
  height?: string;
  format?: string;
}): string {
  return `<script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></script>
<amp-ad width="${width}" height="${height}"
        type="adsense"
        data-ad-client="${ADSENSE_CLIENT}"
        data-ad-slot="${slot}"
        data-auto-format="${format}"
        data-full-width="">
  <div overflow=""></div>
</amp-ad>`;
}

export const AD_SNIPPETS: Record<
  "displayPrimary" | "multiplexPrimary" | "inFeedPrimary",
  SnippetSet
> = {
  displayPrimary: {
    html: htmlSnippet({
      slot: AD_SLOTS.displayPrimary,
      format: "auto",
      extraAttrs: '\n     data-full-width-responsive="true"',
    }),
    amp: ampSnippet({ slot: AD_SLOTS.displayPrimary }),
  },
  multiplexPrimary: {
    html: htmlSnippet({
      slot: AD_SLOTS.multiplexPrimary,
      format: "autorelaxed",
    }),
    amp: ampSnippet({ slot: AD_SLOTS.multiplexPrimary }),
  },
  inFeedPrimary: {
    html: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="fluid"
     data-ad-layout-key="${IN_FEED_LAYOUT_KEY}"
     data-ad-client="${ADSENSE_CLIENT}"
     data-ad-slot="${AD_SLOTS.inFeedPrimary}"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`,
    amp: ampSnippet({ slot: AD_SLOTS.inFeedPrimary, format: "mcrspv" }),
  },
};
