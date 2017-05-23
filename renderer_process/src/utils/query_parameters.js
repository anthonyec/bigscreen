export function getQueryString(obj) {
  const queryStr = Object.keys(obj).reduce((a, k) => {
    a.push(`${k}=${encodeURIComponent(obj[k])}`);
    return a;
  }, []).join('&');
  return `?${queryStr}`;
}
