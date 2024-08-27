import { Provider } from 'react-redux';

import { store } from '@/store';

import logo from './assets/logo.svg';

function App() {
  return (
    <Provider store={store}>
      <img src={logo} className="App-logo" alt="logo" />
    </Provider>
  );
}

export default App;
