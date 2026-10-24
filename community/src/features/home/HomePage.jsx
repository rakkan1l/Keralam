import { usePageMeta } from '../../components/layout/usePageMeta.js';
import Hero from './Hero.jsx';
import Prologue from './Prologue.jsx';
import Identity from './Identity.jsx';
import Chapters from './Chapters.jsx';
import Prelaunch from './Prelaunch.jsx';
import Closing from './Closing.jsx';
import './home.css';

export default function HomePage() {
  usePageMeta(null, 'A serious FiveM roleplay community preparing for launch. Meet the administration, read the rules and apply to join.');
  return (
    <>
      <Hero />
      <Prologue />
      <Identity />
      <Chapters />
      <Prelaunch />
      <Closing />
    </>
  );
}
