import { store } from 'redux/store';
import DAOHeader from './components/DAOHeader';
import DAOList from './components/DAOList';
import './index.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-header-container">
        <DAOHeader />
        <DAOList />
      </div>
    </div>
  );
}
