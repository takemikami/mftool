import React from 'react';
import './App.css';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import JournalBook from "./JournalBook";
import { usePapaParse } from 'react-papaparse';

export function transformCsv(rawData: any) {
    const data: Array<{ [key: string]: any }> = rawData;
    const dateNenkin: { [date: string]: any } = {};
    for (const row of data) {
        if (row['取引日']) {
            var azukari: number = 0
            var mibarai: number = 0
            if (row['借方勘定科目'] === '' && row['貸方勘定科目'] === '預り金' && row['貸方補助科目'] === '社会保険料') {
                azukari += parseInt(row['貸方金額(円)'])
            } else if (row['借方勘定科目'] === '' && row['貸方勘定科目'] === '未払費用' && row['貸方補助科目'] === '未払法定福利費') {
                mibarai += parseInt(row['貸方金額(円)'])
            }
            if (!dateNenkin[row['取引日']]) {
                dateNenkin[row['取引日']] = {}
                dateNenkin[row['取引日']]['azukari'] = 0
                dateNenkin[row['取引日']]['mibarai'] = 0
            }
            dateNenkin[row['取引日']]['azukari'] += azukari
            dateNenkin[row['取引日']]['mibarai'] += mibarai
        }
    }

    var journals: Array<{ [key: string]: any; }> = [];
    var idx = 0;
    var idnum = 0;
    const nowDate = new Date()
    const now = nowDate.getFullYear() + '/'
        + `0${nowDate.getMonth() + 1}`.slice(-2) + '/'
        + `0${nowDate.getDay()}`.slice(-2) + ' '
        + `0${nowDate.getHours()}`.slice(-2) + ':'
        + `0${nowDate.getMinutes()}`.slice(-2) + ':'
        + `0${nowDate.getSeconds()}`.slice(-2);
    for (const dt in dateNenkin) {
        idx++;
        idnum++;
        journals.push({
            id: idnum,
            no: idx,
            dt: dt,
            dr_sbj1: '',
            dr_sbj2: '',
            dr_taxg: '',
            dr_dept: '',
            dr_amount: '',
            dr_tax: '',
            cr_sbj1: '未払金',
            cr_sbj2: '日本年金機構',
            cr_taxg: '',
            cr_dept: '',
            cr_amount: dateNenkin[dt]['azukari'] + dateNenkin[dt]['mibarai'],
            cr_tax: '',
            remarks: '',
            note: '',
            tag: '',
            type: '',
            adjust: '',
            dt_create: now,
            dt_update: now,
        })
        idnum++;
        journals.push({
            id: idnum,
            no: idx,
            dt: dt,
            dr_sbj1: '預り金',
            dr_sbj2: '社会保険料',
            dr_taxg: '対象外',
            dr_dept: '',
            dr_amount: dateNenkin[dt]['azukari'],
            dr_tax: '',
            cr_sbj1: '未払金',
            cr_sbj2: '',
            cr_taxg: '',
            cr_dept: '',
            cr_amount: '',
            cr_tax: '',
            remarks: '預り金:社会保険料 (' + dt + ')',
            note: '',
            tag: '',
            type: '',
            adjust: '',
            dt_create: now,
            dt_update: now,
        })
        idnum++;
        journals.push({
            id: idnum,
            no: idx,
            dt: dt,
            dr_sbj1: '未払費用',
            dr_sbj2: '未払法定福利費',
            dr_taxg: '対象外',
            dr_dept: '',
            dr_amount: dateNenkin[dt]['mibarai'],
            dr_tax: '',
            cr_sbj1: '',
            cr_sbj2: '',
            cr_taxg: '',
            cr_dept: '',
            cr_amount: '',
            cr_tax: '',
            remarks: '未払費用:未払法定福利費 (' + dt + ')',
            note: '',
            tag: '',
            type: '',
            adjust: '',
            dt_create: now,
            dt_update: now,
        })
    }
    return journals;
}

function NenkinShiwake() {
    // ファイルの指定
    const [fileOrigin, setFileOrigin] = React.useState<File>();
    const [fileOriginName, setFileOriginName] = React.useState('');
    const onChangeFileOrigin = (event: React.FormEvent) => {
        const files = (event.target as HTMLInputElement).files
        if (files) {
            setFileOrigin(files[0]);
            setFileOriginName(files[0]['name']);
        }
    };
    const [fileName, setFileName] = React.useState("nenkin");

    // データの生成
    const { readString } = usePapaParse();
    const rows00 = [
        { id: 0, no: null, firstName: null, age: null }
    ]
    const [rows, setRows] = React.useState<Array<{ [key: string]: any; }>>(rows00);
    function handleSubmit() {
        if(fileOrigin) {
            const fileReader = new FileReader();
            fileReader.onload = (e2) => {
                if (e2 && e2.target && e2.target.result) {
                    readString(e2.target.result.toString(), {
                        worker: true,
                        header: true,
                        complete: (results) => {
                            setRows(transformCsv(results['data']))
                        },
                    });
                }
            }
            fileReader.readAsText(fileOrigin, 'Shift_JIS');
            console.log(fileOriginName)
            setFileName('nenkin_' + fileOriginName.replace('仕訳帳_','').replace(/\.[^/.]+$/, ""));
        }
    }

    return (
        <div>
            <Box sx={{ my: 2 }}>
                <Typography>①給与仕訳のエクスポートファイルの指定</Typography>
                <Typography variant="caption" color="text.secondary">
                    MoneyForward会計で、左側メニュー:会計帳簿 → 仕訳帳 → 検索フォーム下ボタン:エクスポート → CSV出力と選び、ストレージに出力された「仕訳帳_YYYYMMDD_HHMM.csv」というファイルをダウンロードし、ここに指定します。(借方勘定科目=役員報酬で絞り込むことをおすすめします)
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <Button
                            component="label"
                            variant="outlined"
                        >
                            給与仕訳CSVの選択
                            <input
                                type="file"
                                accept="text/csv"
                                hidden
                                onChange={onChangeFileOrigin}
                            />
                        </Button>
                    </Grid>
                    <Grid item xs={9} sx={{ my: 2 }}>
                        <TextField
                            id="standard3-basic"
                            label="給与仕訳CSV"
                            value={fileOriginName}
                            variant="filled"
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography>②インポートデータの作成</Typography>
                <Typography variant="caption" color="text.secondary">
                    MoneyForwardの仕訳帳のインポートファイルを作成します、下の表にデータが表示されたらEXPORTからCSVを出力します
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ my: 2 }}>
                        <Button variant="outlined" onClick={handleSubmit}>仕訳インポートデータ作成</Button>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ my: 4 }}>
                <div style={{ height: 400, width: '100%' }}>
                    <JournalBook fileName={ fileName } rows={ rows } />
                </div>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography>③MoneyForwardへのインポート</Typography>
                <Typography variant="caption" color="text.secondary">
                    MoneyForward会計で、左側メニュー:会計帳簿 → 仕訳帳 → 検索フォーム下ボタン:インポート → 仕訳帳と選び「仕訳帳(CSVファイル)のインポート」で、 ②で出力したファイルを指定してインポートします。
                </Typography>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography>④インポート結果の確認</Typography>
                <Typography variant="caption" color="text.secondary">
                    MoneyForward会計で、左側メニュー:会計帳簿 → 残高試算表 → 未払金:日本年金機構 と選び、表示された補助元帳で残高0になっていることを確認する。
                </Typography>
            </Box>
        </div>
    );
}

function Copyright() {
    return (
        <div>
            <Typography variant="body2" color="text.secondary" align="center">
                {'Copyright © Takeshi Mikami. All rights reserved.'}
            </Typography>
        </div>
    );
}

function App() {
  return (
      <Container maxWidth="md">
        <div style={{position: 'absolute', top: '1.2em', left: '1.2em'}}>
          <a href="https://takemikami.github.io/mftool/">&lt;&lt; ツール一覧に戻る</a>
        </div>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
              MoneyFoward会計、給与仕訳の補助ツール
          </Typography>
          <Typography sx={{ mt: 6, mb: 3 }} color="text.secondary">
            MoneyFowardクラウド会計・給与を連携している時に、「給与の仕訳」と「日本年金機構への支払」の中間仕訳のインポートCSVを作成するツールです。<br/>
            ※本ツールに関して、作者・著作権者および関連組織はなんら責任を負いません。自己責任でご利用ください。
          </Typography>
          <NenkinShiwake />
          <Copyright />
        </Box>
      </Container>
  );
}

export default App;
