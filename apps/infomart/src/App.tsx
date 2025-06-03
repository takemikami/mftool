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

// local storage hook
// see. https://www.robinwieruch.de/local-storage-react/
const useLocalStorage = (storageKey: string, initialState: any) => {
    const getState = () => {
        const storageValue: string | null = localStorage.getItem(storageKey)
        if (storageValue != null ) {
            try {
                return JSON.parse(storageValue)
            } catch(ex) {
                console.log(ex)
            }
        }
        return initialState
    }
    const [value, setValue] = React.useState(getState);
    React.useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);
    return [value, setValue];
};

export function transformCsv(rawData: any, settings: { [key: string]: any; }) {
    const data: Array<{ [key: string]: any }> = rawData;
    const seikyuMeisai: { [date: string]: any } = {};
    for (const row of data) {
        if (row['おもて情報.請求書番号']) {
            if (!seikyuMeisai[row['おもて情報.請求書番号']]) {
                seikyuMeisai[row['おもて情報.請求書番号']] = []
            }
            seikyuMeisai[row['おもて情報.請求書番号']].push(row)
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
    for (const num in seikyuMeisai) {
        idx++;
        idnum++;
        journals.push({
            id: idnum,
            no: idx,
            dt: seikyuMeisai[num][0]['おもて情報.請求書発行日'],
            dr_sbj1: '',
            dr_sbj2: '',
            dr_taxg: '',
            dr_dept: '',
            dr_amount: '',
            dr_tax: '',
            cr_sbj1: '未払金',
            cr_sbj2: settings['mibaraiSbj2'],
            cr_taxg: '',
            cr_dept: '',
            cr_amount: seikyuMeisai[num][0]['おもて情報.今回請求金額（税込）'],
            cr_tax: '',
            remarks: seikyuMeisai[num][0]['おもて情報.請求元'] + '(No.' + seikyuMeisai[num][0]['おもて情報.請求書番号'] + ')',
            note: '',
            tag: '',
            type: '',
            adjust: '',
            dt_create: now,
            dt_update: now,
        })
        for (const row of seikyuMeisai[num]) {
            var sbj1 = settings['seikyuSbjC1'];
            var sbj2 = settings['seikyuSbjC2'];
            if (settings['seikyuRuleA'] !== '') {
                if(row['明細情報.明細項目'].match(settings['seikyuRuleA'])) {
                    sbj1 = settings['seikyuSbjA1'];
                    sbj2 = settings['seikyuSbjA2'];
                }
            }
            if (settings['seikyuRuleB'] !== '') {
                if(row['明細情報.明細項目'].match(settings['seikyuRuleB'])) {
                    sbj1 = settings['seikyuSbjB1'];
                    sbj2 = settings['seikyuSbjB2'];
                }
            }

            idnum++;
            journals.push({
                id: idnum,
                no: idx,
                dt: row['おもて情報.請求書発行日'],
                dr_sbj1: sbj1,
                dr_sbj2: sbj2,
                dr_taxg: '課仕 10%',
                dr_dept: '',
                dr_amount: Math.round(parseInt(row['明細情報.金額']) * 1.1),
                dr_tax: '',
                cr_sbj1: '',
                cr_sbj2: '',
                cr_taxg: '',
                cr_dept: '',
                cr_amount: '',
                cr_tax: '',
                remarks: row['明細情報.明細項目'],
                note: '',
                tag: '',
                type: '',
                adjust: '',
                dt_create: now,
                dt_update: now,
            })
        }
    }
    return journals;
}

function InfomartShiwake() {
    // 未払金の補助科目の設定
    const [mibaraiSbj2, setMibaraiSbj2] = useLocalStorage('mibarai-subject2', '');
    const handleChangeMibaraiSbj2 = (event: any) => { setMibaraiSbj2(event.target.value); };

    // 請求明細の勘定科目の設定
    const [seikyuRuleA, setSeikyuRuleA] = useLocalStorage('seikyu-ruleA', '');
    const [seikyuSbjA1, setSeikyuSbjA1] = useLocalStorage('seikyu-subjA1', '');
    const [seikyuSbjA2, setSeikyuSbjA2] = useLocalStorage('seikyu-subjA2', '');
    const [seikyuRuleB, setSeikyuRuleB] = useLocalStorage('seikyu-ruleB', '');
    const [seikyuSbjB1, setSeikyuSbjB1] = useLocalStorage('seikyu-subjB1', '');
    const [seikyuSbjB2, setSeikyuSbjB2] = useLocalStorage('seikyu-subjB2', '');
    const [seikyuSbjC1, setSeikyuSbjC1] = useLocalStorage('seikyu-subjC1', '');
    const [seikyuSbjC2, setSeikyuSbjC2] = useLocalStorage('seikyu-subjC2', '');
    const handleChangeSeikyuRuleA = (event: any) => { setSeikyuRuleA(event.target.value); };
    const handleChangeSeikyuSbjA1 = (event: any) => { setSeikyuSbjA1(event.target.value); };
    const handleChangeSeikyuSbjA2 = (event: any) => { setSeikyuSbjA2(event.target.value); };
    const handleChangeSeikyuRuleB = (event: any) => { setSeikyuRuleB(event.target.value); };
    const handleChangeSeikyuSbjB1 = (event: any) => { setSeikyuSbjB1(event.target.value); };
    const handleChangeSeikyuSbjB2 = (event: any) => { setSeikyuSbjB2(event.target.value); };
    const handleChangeSeikyuSbjC1 = (event: any) => { setSeikyuSbjC1(event.target.value); };
    const handleChangeSeikyuSbjC2 = (event: any) => { setSeikyuSbjC2(event.target.value); };

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
    const [fileName, setFileName] = React.useState("infomart");

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
                            setRows(transformCsv(results['data'], {
                                'mibaraiSbj2': mibaraiSbj2,
                                'seikyuRuleA': seikyuRuleA,
                                'seikyuSbjA1': seikyuSbjA1,
                                'seikyuSbjA2': seikyuSbjA2,
                                'seikyuRuleB': seikyuRuleB,
                                'seikyuSbjB1': seikyuSbjB1,
                                'seikyuSbjB2': seikyuSbjB2,
                                'seikyuSbjC1': seikyuSbjC1,
                                'seikyuSbjC2': seikyuSbjC2
                            }))
                        },
                    });
                }
            }
            fileReader.readAsText(fileOrigin, 'UTF-8');
            console.log(fileOriginName)
            setFileName('infomart_' + fileOriginName.replace('EveryList_','').replace(/\.[^/.]+$/, ""));
        }
    }

    return (
        <div>
            <Box sx={{ my: 2 }}>
                <Typography>①未払金の補助科目の設定</Typography>
                <Typography variant="caption" color="text.secondary">
                    未払金の補助科目に設定する値を指定します(不要な場合は空欄のまま)
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="未払金の補助科目" value={mibaraiSbj2} onChange={handleChangeMibaraiSbj2}/>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography>②請求明細の勘定科目の設定</Typography>
                <Typography variant="caption" color="text.secondary">
                    請求明細に設定する、明細項目に含まれる文字列に応じた勘定科目・補助科目を指定します
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="明細項目に含まれる文字列A" value={seikyuRuleA} onChange={handleChangeSeikyuRuleA}/>
                    </Grid>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="勘定科目A" value={seikyuSbjA1} onChange={handleChangeSeikyuSbjA1}/>
                    </Grid>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="補助科目A" value={seikyuSbjA2} onChange={handleChangeSeikyuSbjA2}/>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="明細項目に含まれる文字列B" value={seikyuRuleB} onChange={handleChangeSeikyuRuleB}/>
                    </Grid>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="勘定科目B" value={seikyuSbjB1} onChange={handleChangeSeikyuSbjB1}/>
                    </Grid>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="補助科目B" value={seikyuSbjB2} onChange={handleChangeSeikyuSbjB2}/>
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        上記に該当しない時
                    </Grid>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="勘定科目C" value={seikyuSbjC1} onChange={handleChangeSeikyuSbjC1}/>
                    </Grid>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <TextField id="sales-sbj2" label="補助科目C" value={seikyuSbjC2} onChange={handleChangeSeikyuSbjC2}/>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ my: 2 }}>
                <Typography>③Infomart受領請求書一覧CSVの指定</Typography>
                <Typography variant="caption" color="text.secondary">
                  InfomartBtoBプラットフォームで、タブ: 受取TOP → 左側メニュー: 全ての請求書 → ダウンロード依頼 と選び、出力された「EveryList_YYYYMMDDHHMM.csv」というファイルをダウンロードし、ここに指定します。
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={3} sx={{ my: 2 }}>
                        <Button
                            component="label"
                            variant="outlined"
                        >
                            受領請求書一覧CSVの選択
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
                            label="受領請求書一覧CSV"
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
                <Typography>④インポートデータの作成</Typography>
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
                <Typography>⑤MoneyForwardへのインポート</Typography>
                <Typography variant="caption" color="text.secondary">
                    MoneyForward会計で、左側メニュー:会計帳簿 → 仕訳帳 → 検索フォーム下ボタン:インポート → 仕訳帳と選び「仕訳帳(CSVファイル)のインポート」で、 ④で出力したファイルを指定してインポートします。
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
              Infomart受領請求書一覧CSV → MoneyForward仕訳CSV 作成ツール
          </Typography>
          <Typography sx={{ mt: 6, mb: 3 }} color="text.secondary">
            「Infomart受領請求書一覧CSV」から「MoneyForward仕訳インポートCSV」を作成するツールです。<br/>
            ※本ツールに関して、作者・著作権者および関連組織はなんら責任を負いません。自己責任でご利用ください。
          </Typography>
          <InfomartShiwake />
          <Copyright />
        </Box>
      </Container>
  );
}

export default App;
