export default function Figures({ figures }) {
  return (figures ?? []).map((figure) => <a key={figure.url} href={figure.url} target="_blank" rel="noopener"><img className="diagram" src={figure.url} alt={figure.alt} /></a>);
}
