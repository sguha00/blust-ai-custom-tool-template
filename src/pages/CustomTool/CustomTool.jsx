import { Alert, Button, Card, CircularProgress, Container, Grid, Paper, TextField } from "@mui/material";
import { useWss } from "blustai-react-core";
import { useEffect,  useState } from "react";

const service_id = import.meta.env.VITE_TOOL_ID //SET YOUR TOOL ID HERE 

const CustomTool = () => {
    const { client } = useWss();
    const [chatId, setChatId] = useState();
    const [response, setResponse] = useState();
    const [images, setImages] = useState();
    const [error, setError] = useState();
    const [submitting, setSubmitting] = useState();

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
                //voice: "VOICE_FILE_URL", //you can use audio files as a prompt (if voice recognition enabled)
                //attachments: [{type:"image",url:"IMAGE_URL"}] //you can attach images (if image recognition enabled)
            });
            setResponse(_response?.body);
            if (_response?.images?.length) setImages(_response.images)
            //_response?.files will contain files (if files are generated and if your tool support file parsing)
            //_response?.voice will contain voice response (if audio output is enabled)
            if (!chatId) setChatId(response?.chat); //saving chatId if not set
        } catch (error) {
            setError(error?.error || error?.message || "Sending message error")
        }
        setSubmitting(false);
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
                </form>
            }
        </Card>
    </Container>
}

export default CustomTool;