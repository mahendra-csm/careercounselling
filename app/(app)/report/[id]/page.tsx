import ReportLayout from '@/components/report/ReportLayout';

interface Props {
  params: { id: string };
}

export default function SharedReportPage({ params }: Props) {
  return <ReportLayout shareToken={params.id} />;
}
