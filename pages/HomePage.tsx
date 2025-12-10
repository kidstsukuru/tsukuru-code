import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import PageTransition from '../components/animations/PageTransition';

const ScratchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.5 3.167H9.333V9.5h3.167a3.167 3.167 0 100-6.333zM20.833 9.5h-3.166V3.167h3.166a3.167 3.167 0 110 6.333zM12.5 14.5H9.333v6.333h3.167a3.167 3.167 0 100-6.333z" />
    </svg>
);

const PythonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.23,19.82c-1.29-.26-2.35-1.12-2.85-2.28-.43-1.02-.38-2.18.15-3.15,.7-1.29,1.88-2.11,3.22-2.28,1.29-.17,2.58,.2,3.54,1.16s1.34,2.25,1.16,3.54c-.17,1.34-1,2.52-2.28,3.22-1.06,.58-2.28,.68-3.47,.49M9.77,4.18c1.29,.26,2.35,1.12,2.85,2.28,.43,1.02,.38,2.18-.15,3.15-.7,1.29-1.88-2.11-3.22,2.28-1.29,.17-2.58-.2-3.54-1.16S4.32,8.48,4.5,7.14c.17-1.34,1-2.52,2.28-3.22,1.06-.58,2.28-.68,3.47-.49M12,11.5v-1h-1V9.5h1V11c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5h-3v1h1v1h-1v1.5c0,.83,.67,1.5,1.5,1.5s1.5-.67,1.5-1.5v-1.5M12,12.5v1h1v1h-1v1.5c0,.83-.67,1.5-1.5,1.5s-1.5-.67-1.5-1.5v-1.5h-1v-1h3Z" />
    </svg>
);

const WebIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13,3a9,9,0,0,0-9,9H1l3.89,3.89.07.14L9,12H6a6,6,0,1,1,6,6v3a9,9,0,0,0,0-18m-1,5v2h2v-2Zm-2,4v2h2v-2Zm4,0v2h2v-2Zm2-4h-2v2h2Z" />
    </svg>
);


const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-6 py-12 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-amber-600 leading-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          ゲームみたいに
          <br />
          楽しく学ぼう！
          <br />
          <span className="text-yellow-500">プログラミングの世界へ！</span>
        </motion.h1>
        <motion.p
          className="mt-6 text-base sm:text-lg text-gray-600 max-w-md md:max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          「Tsukuru code」へようこそ！
          <br className="sm:hidden" />
          パズルを解いたり、キャラクターを動かしながら、プログラミングの基礎をマスターしよう。
        </motion.p>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button variant="primary" size="large" onClick={() => navigate('/login')}>
            冒険をはじめる！
          </Button>
        </motion.div>

        <div className="mt-20">
          <motion.h2
            className="text-3xl font-bold mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            人気のコース
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="bg-amber-100 p-4 rounded-full mb-4">
                  <ScratchIcon className="w-12 h-12 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Scratch入門</h3>
                <p className="text-gray-600">
                  ブロックを組み合わせるだけで、アニメやゲームが作れる！
                </p>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="bg-yellow-100 p-4 rounded-full mb-4">
                  <PythonIcon className="w-12 h-12 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pythonアドベンチャー</h3>
                <p className="text-gray-600">
                  AIやWebアプリで使われる本格的な言語に挑戦！ (準備中)
                </p>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="flex flex-col items-center p-6 text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <WebIcon className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Webサイト探検隊</h3>
                <p className="text-gray-600">
                  自分だけのホームページを作ってみよう！ (準備中)
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default HomePage;