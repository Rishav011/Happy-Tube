import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import examples from "./Example/Example";
import axios from "axios";
//styling
import { Grid, Paper, Button } from "@material-ui/core";
//dropdown
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1), 
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function IdePage() {
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("c");
  const [langId, setLangId] = useState(50);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [output, setOutput] = useState("");
  const valueGetter = useRef();
  const inputGetter = useRef();

  const classes = useStyles();

  const languages = [
    { value: "c", name: "C (GCC 9.2.0)" },
    { value: "cpp", name: "C++ (GCC 9.2.0)" },
    { value: "java", name: "Java (OpenJDK 13.0.1)" },
  ];
  const languageId = { c: 50, cpp: 54, java: 62 };
  const themes = [
    { value: "dark", name: "Dark" },
    { value: "light", name: "Light" },
  ];
  

  function handleEditorDidMount(getValue) {
    setIsEditorReady(true);
    valueGetter.current = getValue;
    // currentValue.current = getValue;
  }
  function inputDidMount(getValue){
    setIsEditorReady(true);
    inputGetter.current = getValue;
  }

  const onLanguageChangeHandler = (event) => {
    setLanguage(event.target.value);
    console.log(languageId[event.target.value]);
    setLangId(languageId[event.target.value]);
  };
  const onThemeChangeHandler = (event) => {
    setTheme(event.target.value);
  };

  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
  const b64DecodeUnicode = (str) =>
    decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  async function postReq() {
    let sentData = {
      language_id: langId,
      source_code: valueGetter.current(),
      stdin:inputGetter.current()
    };
    let config = {
      headers: {
        "content-type": "application/json",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "x-rapidapi-key": "3dd0352351msh895e72986c40bd1p10901bjsn0a63c2638618",
        accept: "application/json",
        useQueryString: true,
      },
    };
    try {
      const res = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        sentData,
        config
      );
      console.log(res.data.token);
      // sleep(2000);
      const response = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${res.data.token}?base64_encoded=true`,
        config
      );
      console.log(response);
      const op =
        response.data.compile_output == null
          ? response.data.stderr == null
            ? b64DecodeUnicode(response.data.stdout)
            : b64DecodeUnicode(response.data.stderr)
          : b64DecodeUnicode(response.data.compile_output);
      setOutput(op);
    } catch (error) {
      console.log(error);
    }
  }

  const onClickHandler = () => {
    console.log(inputGetter.current());
    setOutput(null);
    postReq();
  };

  const options = languages.map((lang, index) => {
    return (
      <MenuItem value={lang.value} key={index}>
        {lang.name}
      </MenuItem>
    );
  });

  const themeOptions = themes.map((theme, index) => {
    return (
      <MenuItem value={theme.value} key={index}>
        {theme.name}
      </MenuItem>
    );
  }); 

  return (
    <div style={{ paddingTop: "5px" }}>
      <Grid container spacing={3}>
        {/* <Grid xs={12} item sm={12} lg={5}>
          <Paper className="paper" style={{ padding: 15,marginLeft:15}}>
            <h1 style={{paddingLeft:10}}>Problem Statement</h1>
            <span style={{display:"inline-block",paddingLeft:10}}>{examples.statement}</span>
          </Paper>
        </Grid> */}
        <Grid item xs={12} sm={12} lg={7}>
          <Paper className="paper" style={{ padding: 15,marginRight:15 }}>
            <div style={{ textAlign: "right", marginRight: 20 }}>
              <FormControl
                className={classes.formControl}
                disabled={!isEditorReady}
              >
                <InputLabel id="demo-simple-select-label">Theme</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={theme}
                  onChange={onThemeChangeHandler}
                >
                  {themeOptions}
                </Select>
              </FormControl>
              <FormControl
                className={classes.formControl}
                disabled={!isEditorReady}
              >
                <InputLabel id="demo-simple-select-label">Language</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={language}
                  onChange={onLanguageChangeHandler}
                >
                  {options}
                </Select>
              </FormControl>
            </div>
            <div style={{ marginTop: "10px" }}>
              <Editor
                height={500} // By default, it fully fits with its parent
                theme={theme}
                language={language}
                value={examples[language]}
                editorDidMount={handleEditorDidMount}
                loading={"Loading..."}
              />
            </div>
            <div style={{ textAlign: "right", marginRight: 20 }}>
              {output!=null ? <Button
                variant="contained"
                style={{ margin: 20 }}
                onClick={onClickHandler}
                disabled={!isEditorReady}
              >
                Run Code
              </Button>:<Button
                variant="contained"
                style={{ margin: 20 }}
                onClick={onClickHandler}
                disabled={true}
              >
                Compiling...
              </Button>}
            </div>
          </Paper>
        </Grid>
        {/* <Grid xs={12} item sm={12} lg={5}></Grid> */}
        <Grid item xs={12} sm={12} lg={5}>
        <Paper className="paper" style={{ padding:15 }}>
          <div>
            <h1>Input</h1>
            <Editor
              height={225} // By default, it fully fits with its parent
              theme={theme}
              editorDidMount={inputDidMount}
            />
          </div>
          </Paper>
          
        <Paper className="paper" style={{ padding:15,marginTop:15 }}>
          <div>
            <h1>Output</h1>
            <Editor
              height={225} // By default, it fully fits with its parent
              theme={theme}
              value={output}
            />
          </div>
          </Paper>
       
        </Grid>
      </Grid>
    </div>
  );
}
export default IdePage;
