/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState, useRef, useMemo, } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

type Exercise = {
  id: string;
  answerPre: string;
  answerSuf: string;
  answerWord: string;
  questionPre: string;
  questionSuf: string;
  questionWord: string;
  options: string[];
}

const App = gestureHandlerRootHOC(() => {

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%'], []);

  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [phase, setPhase] = useState<number>(0);
  const [selected, setSelected] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    getExercises();
  }, []);

  const getExercises = (): void => {
    firestore()
    .collection('exercises')
    .get()
    .then(querySnapshot  => {  
      const docData: Array<Exercise> = querySnapshot.docs.map((doc) => ({...doc.data() as Exercise, id: doc.id}));
      setExercises(docData);
    });
  };

  const checkAnswer = () => {
    if (selected === exercises[phase].answerWord) 
      setIsCorrect(true);
    else
      setIsCorrect(false);
    bottomSheetModalRef.current?.present();
  }

  const selectOption = (option: string) => {
    setSelected(option);
  }

  const next = () => {    
    bottomSheetModalRef.current?.close();
    setIsCorrect(undefined);
    setSelected('');
    if (phase < exercises.length - 1) 
      setPhase(phase + 1);
    else
      setPhase(0);
  }

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Fill in the missing word</Text>
        {exercises.length ? <>
          <View style={styles.questionView}>
            <Text style={styles.question}>{exercises[phase].questionPre ? exercises[phase].questionPre + ' ' : '' }</Text>
            <Text style={styles.questionWord}>{exercises[phase].questionWord}</Text>
            <Text style={styles.question}>{exercises[phase].questionSuf ? ' ' + exercises[phase].questionSuf : '' }</Text>
          </View>
          <View style={styles.answerView}>
            <Text style={styles.answer}>{exercises[phase].answerPre}</Text>
            {selected ? 
              <View style={[styles.optionButton, {backgroundColor: isCorrect === true ? '#39eaea' : isCorrect === false ? '#ff7b88' : '#ffffff'}]}>
                <Text style={[styles.optionText, {color: isCorrect === undefined ? '#3c6c82' : '#ffffff'}]}>{selected}</Text>
              </View> : 
              <View style={{width: 70, borderBottomWidth: 1, borderBottomColor: '#ffffff', marginHorizontal: 10}}/> 
            }
            <Text style={styles.answer}>{exercises[phase].answerSuf}</Text>
          </View>
          <View style={styles.optionsView}>
            {exercises[phase].options.map(option => 
              <TouchableOpacity key={option} style={styles.optionButton} onPress={() => selectOption(option)}>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            )}
          </View>
        </> : <></>}
        <TouchableOpacity onPress={() => checkAnswer()} style={selected ? styles.checkAnswer : styles.disabledCheckAnswer} disabled={!selected}>
          <Text style={styles.checkAnswerText}>Check Answer</Text>
        </TouchableOpacity> 
        <BottomSheetModal
            backgroundStyle={isCorrect? styles.correctContainer : styles.wrongContainer}
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{isCorrect? 'Great Job!' : `Answer: ${exercises.length ? exercises[phase].answerWord: ''}`}</Text>
              <TouchableOpacity onPress={next} style={styles.continueBtn}>
                <Text style={[styles.continueText, {color: isCorrect ? '#39eaea' : '#ff7b88'}]}>CONTINUE</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#3c6c82'
  },
  header: {
    marginTop: 20,
    fontSize: 16,
    color: 'white',
    fontWeight: '200',
  },
  questionView: {
    marginTop: 30,
    flexDirection: 'row',
  },
  question: {
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
    letterSpacing: 2,
  },
  questionWord: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 2,
    borderBottomColor: '#ffffff',
    borderBottomWidth: 1,
  },
  answerView: {
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center'
  },
  answer: {
    fontSize: 20,
    color: 'white',
    fontWeight: '400',
    letterSpacing: 4,
  },
  answerWord: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0,
  },
  optionsView: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 50,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  optionText: {
    color: '#3c6c82',
    fontSize: 18,
    fontWeight: '700'
  },
  disabledCheckAnswer: {
    backgroundColor: '#ffffff2f',
    paddingVertical: 15,
    borderRadius: 30,
    paddingHorizontal: 50,
    marginTop: 'auto',
    marginBottom: 30,
  },
  checkAnswer: {
    backgroundColor: '#39eaea',
    paddingVertical: 15,
    borderRadius: 30,
    paddingHorizontal: 50,
    marginTop: 'auto',
    marginBottom: 30,
  },
  checkAnswerText: {
    fontWeight: '700',
    fontSize: 20,
    color: '#ffffff'
  },
  correctContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#39eaea',
  },
  wrongContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ff7b88',
  },
  modalContainer: {
    paddingHorizontal: 30,    
  },
  modalText: {
    fontWeight: '700',
    color: '#ffffff'
  },
  continueBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    alignSelf: 'stretch',
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30
  },
  continueText: {
    marginHorizontal: 'auto',
    fontSize: 20,
    fontWeight: '700'
  }
});

export default App;
