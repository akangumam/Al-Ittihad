import ClassDetail from '@/views/akademik/ClassDetail'

export default function DetailKelasPage({ params }: { params: { id: string } }) {
  return <ClassDetail classId={params.id} />
}
