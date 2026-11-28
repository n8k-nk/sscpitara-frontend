import RouteSkeleton from "../../components/RouteSkeleton";

export default function Loading() {
  return <>
    <div className="page-head pyq-cover"><p className="skeleton-title">Previous year questions</p></div>
    <RouteSkeleton label="PYQ archive" inline />
  </>;
}
