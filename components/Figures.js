export default function Figures({ figures }) {
  return (figures ?? []).map((figure) => <img className="diagram" key={figure.url} src={figure.url} alt={figure.alt} />);
}
