import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, FlexContainer, PageTitle } from '../components/atoms';
import { FarmForm, ProducerForm } from '../components/molecules';
import { ProducersList } from '../components/organisms';
import { useApi } from '../hooks';
import { AppDispatch, RootState } from '../store';
import {
  clearError,
  createFarmAsync,
  createProducerAsync,
  deleteFarmAsync,
  deleteProducerAsync,
  fetchFarms,
  fetchProducers,
  selectAllProducers,
  selectError,
  selectLoading,
  selectOperationLoading,
  updateFarmAsync,
  updateProducerAsync,
} from '../store/slices/producersSlice';
import { Farm, Producer } from '../types';

type ModalState =
  | { type: 'none' }
  | { type: 'producer'; producer?: Producer }
  | { type: 'farm'; producerId: string; farm?: Farm };

export const ProducersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const producers = useSelector((state: RootState) => selectAllProducers(state));
  const loading = useSelector((state: RootState) => selectLoading(state));
  const operationLoading = useSelector((state: RootState) => selectOperationLoading(state));
  const error = useSelector((state: RootState) => selectError(state));
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const api = useApi();

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchProducers());
    dispatch(fetchFarms());
  }, [dispatch]);

  const handleAddProducer = () => {
    setModal({ type: 'producer' });
  };

  const handleEditProducer = (producer: Producer) => {
    setModal({ type: 'producer', producer });
  };

  const handleDeleteProducer = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produtor? Esta ação não pode ser desfeita.')) {
      api.callApi(deleteProducerAsync, id, {
        onSuccess: () => {
          // After successful deletion, refresh the list
          dispatch(fetchProducers());
        },
        onError: (errorMsg) => {
          console.error('Failed to delete producer:', errorMsg);
        }
      });
    }
  };

  const handleAddFarm = (producerId: string) => {
    setModal({ type: 'farm', producerId });
  };

  const handleEditFarm = (producerId: string, farm: Farm) => {
    setModal({ type: 'farm', producerId, farm });
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta fazenda? Esta ação não pode ser desfeita.')) {
      api.callApi(deleteFarmAsync, farmId, {
        onSuccess: () => {
          // After successful deletion, refresh the list
          dispatch(fetchFarms());
          dispatch(fetchProducers());
        },
        onError: (errorMsg) => {
          console.error('Failed to delete farm:', errorMsg);
        }
      });
    }
  };

  const handleProducerSubmit = async (data: Omit<Producer, 'id' | 'farms' | 'createdAt' | 'updatedAt'>) => {
    if (modal.type === 'producer' && modal.producer) {
      // Update existing producer
      api.callApi(
        updateProducerAsync,
        { id: modal.producer.id, data: { ...data } },
        {
          onSuccess: () => {
            setModal({ type: 'none' });
            dispatch(fetchProducers());
          },
          onError: (errorMsg) => {
            console.error('Failed to update producer:', errorMsg);
          }
        }
      );
    } else {
      // Add new producer
      api.callApi(
        createProducerAsync,
        data,
        {
          onSuccess: () => {
            setModal({ type: 'none' });

            dispatch(fetchProducers());
          },
          onError: (errorMsg) => {
            console.error('Failed to create producer:', errorMsg);
          }
        }
      );

      setModal({ type: 'none' });
    }
  }; const handleFarmSubmit = async (data: Omit<Farm, 'id' | 'createdAt' | 'updatedAt' | 'producerId'>) => {
    if (modal.type === 'farm') {
      if (modal.farm) {
        // Update existing farm
        api.callApi(
          updateFarmAsync,
          {
            id: modal.farm.id,
            data: { ...data },
          },
          {
            onSuccess: () => {
              setModal({ type: 'none' });
              dispatch(fetchFarms());
              dispatch(fetchProducers());
            },
            onError: (errorMsg) => {
              console.error('Failed to update farm:', errorMsg);
            }
          }
        );
      } else {
        // Add new farm
        api.callApi(
          createFarmAsync,
          {
            ...data,
            producerId: modal.producerId,
          },
          {
            onSuccess: () => {
              setModal({ type: 'none' });
              dispatch(fetchFarms());
              dispatch(fetchProducers());
            },
            onError: (errorMsg) => {
              console.error('Failed to create farm:', errorMsg);
            }
          }
        );
      }
    }
  };

  const handleCloseModal = () => {
    setModal({ type: 'none' });
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div>
      <FlexContainer justify="space-between" align="center" style={{ marginBottom: '2rem' }}>
        <PageTitle style={{ margin: 0 }}>Produtores Rurais</PageTitle>
        <Button onClick={handleAddProducer} disabled={operationLoading.create}>
          {operationLoading.create ? 'Criando...' : '+ Novo Produtor'}
        </Button>
      </FlexContainer>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c00',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{error}</span>
          <Button onClick={handleClearError}>
            ✕
          </Button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Carregando produtores...</p>
        </div>
      ) : (
        <ProducersList
          producers={producers}
          onEditProducer={handleEditProducer}
          onDeleteProducer={handleDeleteProducer}
          onAddFarm={handleAddFarm}
          onEditFarm={handleEditFarm}
          onDeleteFarm={handleDeleteFarm}
        />
      )}          {/* Producer Form Modal */}
      {modal.type === 'producer' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            width: '100%',
          }}>
            <ProducerForm
              producer={modal.producer}
              onSubmit={handleProducerSubmit}
              onCancel={handleCloseModal}
              loading={operationLoading.create || operationLoading.update}
            />
          </div>
        </div>
      )}

      {/* Farm Form Modal */}
      {modal.type === 'farm' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>          <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          width: '100%',
        }}>
            <FarmForm
              farm={modal.farm}
              onSubmit={handleFarmSubmit}
              onCancel={handleCloseModal}
              loading={operationLoading.create || operationLoading.update}
            />
          </div>
        </div>
      )}
    </div>
  );
};
