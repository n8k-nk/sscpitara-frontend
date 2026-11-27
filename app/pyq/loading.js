import RouteSkeleton from "../../components/RouteSkeleton";

export default function Loading() {
  return <>
    <div className="page-head pyq-cover"><h1>Previous year questions</h1></div>
    <RouteSkeleton label="PYQ archive" inline />
  </>;
}
