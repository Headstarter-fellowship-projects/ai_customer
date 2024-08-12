'use client'
import { Box, Button, TextField, Stack, createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { useState} from "react";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "./firebase/config";
import { useRouter } from "next/navigation";
import ResponsiveAppBar from "./Appbar/AppBar";
import bgImage from './images/headstarter_bg.jpeg'

export default function Home() {

  const [signOut] = useSignOut(auth)
  const router = useRouter()
  

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi. I am the Headstarter virtual assistant. How can I help you today?' }
  ])

  const [text, setText] = useState('')

  
  const sendMessage = async () => {

    setText('')
    setMessages((messages) => [ ...messages, { role: 'user', content: text }, { role: 'assistant', content: '' } ])

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'user', content: text })
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
              role: 'assistant'
            }
          ]
        })
        return reader.read().then(processText)
      })
    })
  }

  const handleSignOut = async () => {  
    await signOut()
    // sessionStorage.removeItem('user')
    router.push('/sign-in')
  }

  // Create a dark theme
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#1a73e8',
      },
      secondary: {
        main: '#bb86fc',
      },
      background: {
        default: '#121212',
        paper: '#1d1d1d',
      },
      text: {
        primary: '#ffffff',
      }
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ResponsiveAppBar />
      <Box 
        width={'100vw'}
        height={'100vh' } 
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={5}
        sx={{
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        
        {/* <AuthState /> */}
        <Stack direction={'column'} width='700px' height='700px' border='1px solid #333' borderRadius={5} justifyContent='flex-end' p={1.8} gap={2} bgcolor='#161616'>
          <Stack direction={'column'} spacing={2} flexGrow={1} overflow={'auto'} maxHeight={'100%'} >
            {
              messages.map((message, index) => (
                <Box
                  key={index}
                  display={'flex'}
                  justifyContent={ message.role === 'assistant' ? 'flex-start' : 'flex-end' } 
                >
                  <Box
                    bgcolor={ message.role === 'assistant' ? '#163257' : '#101838' }
                    color={'white'}
                    borderRadius={11}
                    p={2}
                  >
                    { message.content }
                  </Box>
                </Box>
              ))
            }
          </Stack>
        
          <Stack flexDirection={'row'} gap={1} >
            <TextField 
              label="Message" 
              fullWidth 
              value={text} 
              onChange={(event) => setText(event.target.value)} 
              InputLabelProps={{ style: { color: '#bbb' } }}
              InputProps={{
                style: { color: '#fff' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#555',
                  },
                  '&:hover fieldset': {
                    borderColor: '#777',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#888',
                  },
                },
              }}
            />
            <Button variant="contained" size="medium" endIcon={<SendIcon />} onClick={sendMessage} sx={{ borderRadius: 4 }}  >Send</Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  )
}