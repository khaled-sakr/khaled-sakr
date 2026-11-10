/*
 * Small pieces shared by the VHS shelf (VhsProjects), its detail sheet and the
 * ledger under it (ProjectsLedger).
 */

export interface Shot {
  src: string;
  /** What the screenshot shows, written as a caption. */
  caption: string;
  w: number;
  h: number;
}

/** Arabic run inside an English label. */
export function Ar({ children }: { children: string }) {
  return (
    <bdi className="a" lang="ar" dir="rtl">
      {children}
    </bdi>
  );
}

interface DetailProject {
  title: string;
  stack: string;
  did?: string[];
  who?: string;
  features?: string[];
  platforms?: string;
  fact?: string;
  shots?: Shot[];
}

/** Stack chips on the sheet's first screen, in a .mk/.ln pair so the line-by-line reveal picks them up. */
export function VhsDetailBody({ p }: { p: DetailProject | null }) {
  if (!p) return null;
  return (
    <div className="mk">
      <ul className="ln vd-chips" aria-label="Stack">
        {p.stack.split(' · ').map((c) => (
          <li key={c} className="lbl">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

const hasDossier = (p: DetailProject | null) => !!p && !!(p.fact || p.who || p.features?.length || p.did?.length || p.platforms);

/**
 * The case file below the sheet's first screen: one fact from the product set large, then who it
 * is for, what is in it, what Khaled did and where it runs.
 */
export function VhsDossier({ p }: { p: DetailProject | null }) {
  if (!p || !hasDossier(p)) return null;
  return (
    <section className="vddoss" aria-labelledby="vd-doss-h">
      <h4 id="vd-doss-h" className="sr-only">
        About {p.title}
      </h4>
      {p.fact && <p className="vd-fact">{p.fact}</p>}
      <div className="vd-cols">
        {p.who && (
          <div>
            <h5 className="lbl vd-k">
              Who it&rsquo;s for / <Ar>لمين</Ar>
            </h5>
            <p className="vd-p">{p.who}.</p>
            {p.platforms && (
              <>
                <h5 className="lbl vd-k vd-k2">
                  Where it runs / <Ar>بيشتغل فين</Ar>
                </h5>
                <p className="vd-p">{p.platforms}</p>
              </>
            )}
          </div>
        )}
        {p.features && p.features.length > 0 && (
          <div>
            <h5 className="lbl vd-k">
              What&rsquo;s in it / <Ar>فيه إيه</Ar>
            </h5>
            <ul className="vd-list">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}
        {p.did && p.did.length > 0 && (
          <div>
            <h5 className="lbl vd-k">
              My part / <Ar>دوري</Ar>
            </h5>
            <ul className="vd-list vd-did">
              {p.did.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/** Real screenshots of the project, below the fold of the detail sheet. */
export function VhsScreens({ p }: { p: DetailProject | null }) {
  if (!p?.shots?.length) return null;
  return (
    <section className="vdshots" aria-labelledby="vd-shots-h">
      <h4 id="vd-shots-h" className="lbl">
        Screens / <Ar>لقطات</Ar>
      </h4>
      <div className="vdshots-row">
        {p.shots.map((s) => (
          <figure key={s.src} className={s.h > s.w ? 'tall' : undefined}>
            <img src={s.src} alt={`${p.title} screenshot`} width={s.w} height={s.h} loading="lazy" decoding="async" draggable={false} />
            <figcaption>{s.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
