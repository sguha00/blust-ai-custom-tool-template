import { Alert, Button, Card, CircularProgress, Container, Grid, Paper, TextField } from "@mui/material";
import { useWss } from "blustai-react-core";
import { useEffect,  useState } from "react";
import { styled } from '@mui/material/styles';
import { Box, ButtonBase,CardMedia, CardContent,Typography } from "@mui/material";
const Product = ({ product }) => <ButtonBase sx={{width:"200px",m:2}} href={product?.link} target="_blank"><Card  >
   <CardMedia component="img" image={product?.thumbnail || 'https://blust-images.s3.amazonaws.com/public/noimage.jpeg'} src={product?.thumbnail} />
   <CardContent>
       <Typography variant="caption">{product?.title}</Typography>
       <Typography variant="body2">{product?.description}</Typography>
       <Typography variant="subtitle1">{product?.price}</Typography>
   </CardContent>
</Card></ButtonBase>
const VisuallyHiddenInput = styled('input')({ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: 1, overflow: 'hidden', position: 'absolute', bottom: 0, left: 0, whiteSpace: 'nowrap',  width: 1});


const service_id = import.meta.env.VITE_TOOL_ID //SET YOUR TOOL ID HERE 

const CustomTool = () => {
    const { client } = useWss();
    const [chatId, setChatId] = useState();
    const [response, setResponse] = useState();
    const [images, setImages] = useState();
    const [error, setError] = useState();
    const [submitting, setSubmitting] = useState();
    const [products, setProducts] = useState();
    const [uploadedFile,setUploadedFile]=useState();

    useEffect(() => {
        client.init({
            onReady: () => {
                console.log("Blust AI Client ready");
                //if you know chatId - you can load history: client.getHistory({service: service_id, chat:chatId}) 
                //or you can get history for last chat: client.getHistory({service: service_id})
            },
            onError: (error) => setError(error?.error || error?.message || "Blust AI Client init error")
        });
    }, [])

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log("here",e.target.elements.prompt.value)
        if (!e.target.elements.prompt.value) { setError("Please, input prompt"); return };
        setSubmitting(true);
        try {
            setError(null);
            setResponse(null);
            let _response = await client.sendMessage({
                service: service_id,
                chat: chatId, //if null - new thread will be created
                message: e.target.elements.prompt.value,
                onStream: (text) => setResponse(text),
                ...uploadedFile?.url && {attachments: [{type:"image",url:uploadedFile.url}]},
                //voice: "VOICE_FILE_URL", //you can use audio files as a prompt (if voice recognition enabled)
                //attachments: [{type:"image",url:"IMAGE_URL"}] //you can attach images (if image recognition enabled)
            });
            let json=parseJSONAnswer(_response?.body);
            setResponse(json.content);
            setProducts(json.organic_results || []);
            if (_response?.images?.length) setImages(_response.images)
            //_response?.files will contain files (if files are generated and if your tool support file parsing)
            //_response?.voice will contain voice response (if audio output is enabled)
            if (!chatId) setChatId(response?.chat); //saving chatId if not set
        } catch (error) {
            setError(error?.error || error?.message || "Sending message error")
        }
        setSubmitting(false);
    }


    const parseJSONAnswer = (message) => {
        let original_message = message;
        let jsonregex = /((\[[^\}]+)?\{s*[^\}\{]{3,}?:.*\}([^\{]+\])?)/gms;
        let matches = message.match(jsonregex);
        if (matches && matches[0])  message = matches[0];
        let json, jsonerr;
        try {
            json = JSON.parse(message);
        } catch (err) {
            jsonerr = err;
        }
        if (!json) {
            let re = /([^```]*)```json(.*)```(.+)/gms
            let matches = [...original_message?.matchAll(re)];
            if (matches[0] && matches[0][1] && matches[0][2]) {
                try {
                    json = JSON.parse(matches[0][2]);
                } catch (err) {
                    jsonerr = err;
                }
            }
        }
        return json || {content: original_message}
     }
     
     
     
     const uploadFile=async (e)=>{
        setError();
        try {
            let file=await client.uploadFile({service:service_id,chat:chatId,file:e.target.files[0]});
            console.log("file uploaded",file);
            setUploadedFile({url:file?.url,name:e.target.files[0].name});
        } catch (err) {
            setError("Upload error");
            console.log("Upload error", err);
        }
     }
     
     

    return <Container maxWidth="md" >
        <Card sx={{ p: 4, m: 4 }}>
            {error &&
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            }
            {!service_id ?
                <Alert severity="error" sx={{ mb: 2 }}>Please, set service_id</Alert>
                :
                <form action="#" onSubmit={onSubmit}>
                    <TextField name="prompt"  label="Prompt" rows={5} multiline fullWidth />
                    {uploadedFile &&
                        <Box>
                            <Typography variant="caption">{uploadedFile.name}</Typography>
                        </Box>
                    }
                    <Button sx={{ mt: 2,mr:2 }} component="label" variant="contained" > Attach file <VisuallyHiddenInput type="file" onChange={uploadFile}  /> </Button>
                    <Button 
                        type="submit" 
                        sx={{ mt: 2 }} 
                        disabled={submitting}
                    >Send {submitting && <CircularProgress size={"1em"}/>}
                    </Button>
                    {response &&
                        <Paper sx={{p:2,mt:2,mb:2}}>{response}</Paper>
                    }
                    {images?.map((img, key) => <img key={key} src={img.url} width="150" />)}
                    {!submitting && products?.map((product,key)=><Product product={product} key={key}/>)}
                </form>
            }
        </Card>
    </Container>
}

export default CustomTool;