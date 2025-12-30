import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Issue, IssueFormData, Priority, Status } from '../types/issue';

export const createIssue = async (
  issueData: IssueFormData,
  createdBy: string
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'issues'), {
    ...issueData,
    createdBy,
    createdTime: Timestamp.now(),
  });
  return docRef.id;
};

export const getIssues = async (
  statusFilter?: Status,
  priorityFilter?: Priority
): Promise<Issue[]> => {
  let q = query(collection(db, 'issues'), orderBy('createdTime', 'desc'));

  // Apply filters - Firestore will require composite indexes if both filters are used
  // The error will guide you to create the index in Firebase Console
  if (statusFilter && priorityFilter) {
    q = query(
      q,
      where('status', '==', statusFilter),
      where('priority', '==', priorityFilter)
    );
  } else if (statusFilter) {
    q = query(q, where('status', '==', statusFilter));
  } else if (priorityFilter) {
    q = query(q, where('priority', '==', priorityFilter));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdTime: doc.data().createdTime.toDate(),
  })) as Issue[];
};

export const updateIssueStatus = async (
  issueId: string,
  newStatus: Status,
  oldStatus: Status
): Promise<void> => {
  if (oldStatus === 'Open' && newStatus === 'Done') {
    throw new Error('Cannot move issue directly from Open to Done');
  }

  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, {
    status: newStatus,
  });
};

export const findSimilarIssues = async (
  title: string,
  description: string
): Promise<Issue[]> => {
  const allIssues = await getIssues();
  
  // If no existing issues, return empty array
  if (allIssues.length === 0) {
    return [];
  }
  
  // Simple similarity check: check if title or description contains similar keywords
  const titleWords = title.toLowerCase().split(/\s+/);
  const descWords = description.toLowerCase().split(/\s+/);
  // Filter out common words and keep meaningful words (length > 2 instead of 3)
  const searchTerms = [...titleWords, ...descWords].filter(
    (word) => word.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'way', 'use', 'her', 'she', 'him', 'has', 'had', 'did', 'its', 'who', 'may', 'say', 'she', 'use', 'her', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
  );

  // If no meaningful search terms, return empty
  if (searchTerms.length === 0) {
    return [];
  }

  const similarIssues = allIssues.filter((issue) => {
    const issueTitle = issue.title.toLowerCase();
    const issueDesc = issue.description.toLowerCase();

    // Check if at least 1 keyword matches (lowered from 2 to make it more sensitive)
    const matchCount = searchTerms.filter(
      (term) => issueTitle.includes(term) || issueDesc.includes(term)
    ).length;

    // Also check for partial title matches (if title contains significant portion of existing title)
    const titleSimilarity = titleWords.some(word => 
      word.length > 3 && (issueTitle.includes(word) || issueDesc.includes(word))
    );

    return matchCount >= 1 || titleSimilarity;
  });

  return similarIssues.slice(0, 5); // Return top 5 similar issues
};

