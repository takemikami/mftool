import React from 'react';
import { DataGrid, GridToolbarContainer, GridToolbarExport} from '@mui/x-data-grid';

const columns = [
    { field: 'no', headerName: '取引No', sortable: false, width: 80 },
    { field: 'dt', headerName: '取引日', sortable: false, width: 100 },
    // debtor
    { field: 'dr_sbj1', headerName: '借方勘定科目', sortable: false, width: 100 },
    { field: 'dr_sbj2', headerName: '借方補助科目', sortable: false, width: 100 },
    { field: 'dr_taxg', headerName: '借方税区分', sortable: false, width: 100 },
    { field: 'dr_dept', headerName: '借方部門', sortable: false, width: 100 },
    { field: 'dr_amount', headerName: '借方金額(円)', sortable: false, width: 100 },
    { field: 'dr_tax', headerName: '借方税額', sortable: false, width: 100 },
    // creditor
    { field: 'cr_sbj1', headerName: '貸方勘定科目', sortable: false, width: 100 },
    { field: 'cr_sbj2', headerName: '貸方補助科目', sortable: false, width: 100 },
    { field: 'cr_taxg', headerName: '貸方税区分', sortable: false, width: 100 },
    { field: 'cr_dept', headerName: '貸方部門', sortable: false, width: 100 },
    { field: 'cr_amount', headerName: '貸方金額(円)', sortable: false, width: 100 },
    { field: 'cr_tax', headerName: '貸方税額', sortable: false, width: 100 },
    // other
    { field: 'remarks', headerName: '摘要', sortable: false, width: 100 },
    { field: 'note', headerName: '仕訳メモ', sortable: false, width: 100 },
    { field: 'tag', headerName: 'タグ', sortable: false, width: 100 },
    { field: 'type', headerName: 'MF仕訳タイプ', sortable: false, width: 100 },
    { field: 'adjust', headerName: '決算整理仕訳', sortable: false, width: 100 },
    { field: 'dt_create', headerName: '作成日時', sortable: false, width: 100 },
    { field: 'dt_update', headerName: '最終更新日時', sortable: false, width: 100 },
];

function CustomToolbar(csvOptions: any) {
    return (
        <GridToolbarContainer>
            <GridToolbarExport
                printOptions={{ disableToolbarButton: true }}
                csvOptions={csvOptions}
            />
        </GridToolbarContainer>
    );
}

function JournalBook(props: any) {
    return (
        <DataGrid
            rows={props.rows}
            columns={columns}
            disableSelectionOnClick
            components={{
                Toolbar: CustomToolbar,
            }}
            componentsProps={{
                toolbar: {fileName: props.fileName}
            }}
        />
    );
}

export default JournalBook;
