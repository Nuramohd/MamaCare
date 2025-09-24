import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView source={{ uri: 'http://localhost:192.168.1.134' }} style={{ flex: 1 }} />
  );
}
