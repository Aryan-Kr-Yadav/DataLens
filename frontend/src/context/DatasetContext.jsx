import { createContext, useState, useContext } from 'react';

const DatasetContext = createContext(null);

export const DatasetProvider = ({ children }) => {
  const [activeDataset, setActiveDatasetState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('datalens_dataset');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [datasetStatus, setDatasetStatus] = useState(activeDataset ? 'ready' : 'idle');
  const [error, setError] = useState(null);

  const setActiveDataset = (dataset) => {
    setActiveDatasetState(dataset);
    setDatasetStatus(dataset ? 'ready' : 'idle');
    setError(null);
    if (dataset) {
      sessionStorage.setItem('datalens_dataset', JSON.stringify(dataset));
    } else {
      sessionStorage.removeItem('datalens_dataset');
    }
  };

  const clearDataset = () => {
    setActiveDatasetState(null);
    sessionStorage.removeItem('datalens_dataset');
    setDatasetStatus('idle');
    setError(null);
  };

  const refreshDataset = () => {
    const saved = sessionStorage.getItem('datalens_dataset');
    try {
      const dataset = saved ? JSON.parse(saved) : null;
      setActiveDatasetState(dataset);
      setDatasetStatus(dataset ? 'ready' : 'idle');
      return dataset;
    } catch {
      clearDataset();
      return null;
    }
  };

  return (
    <DatasetContext.Provider value={{
      activeDataset,
      datasetId: activeDataset?.dataset_id || null,
      datasetMetadata: activeDataset,
      datasetStatus,
      error,
      setActiveDataset,
      setDataset: setActiveDataset,
      clearDataset,
      refreshDataset
    }}>
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};
