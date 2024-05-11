import Link from 'next/link';

export default function ExportExcelButton() {
    return (
        <Link className='searchbar-button' href={'/export/xlsx'}>Экспортировать в формате .xlsx</Link>
    );
}