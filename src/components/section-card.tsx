export default function SectionCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="col-span-12 bg-base-300 rounded-lg p-4">{children}</div>
  );
}
