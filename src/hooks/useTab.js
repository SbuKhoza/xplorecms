import { useSearchParams } from 'react-router-dom'

/** Active tab lives in the URL (?tab=…) so refresh / back / shared links keep working. */
export function useTab(keys, fallback = keys[0]) {
  const [params, setParams] = useSearchParams()
  const t = params.get('tab')
  const tab = keys.includes(t) ? t : fallback
  return [tab, (k) => setParams({ tab: k }, { replace: true })]
}
