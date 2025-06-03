import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Producer, Farm } from '../types';
import { 
  selectAllProducers, 
  addProducer, 
  updateProducer, 
  deleteProducer,
  addFarm,
  updateFarm,
  deleteFarm,
} from '../store/slices/producersSlice';
import { PageTitle, Button, FlexContainer } from '../components/atoms';
import { ProducerForm, FarmForm } from '../components/molecules';
import { ProducersList } from '../components/organisms';

type ModalState = 
  | { type: 'none' }
  | { type: 'producer'; producer?: Producer }
  | { type: 'farm'; producerId: string; farm?: Farm };

export const ProducersPage: React.FC = () => {
  const dispatch = useDispatch();
  const producers = useSelector(selectAllProducers);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [loading, setLoading] = useState(false);

  const handleAddProducer = () => {
    setModal({ type: 'producer' });
  };

  const handleEditProducer = (producer: Producer) => {
    setModal({ type: 'producer', producer });
  };

  const handleDeleteProducer = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produtor? Esta ação não pode ser desfeita.')) {
      dispatch(deleteProducer(id));
    }
  };

  const handleAddFarm = (producerId: string) => {
    setModal({ type: 'farm', producerId });
  };

  const handleEditFarm = (producerId: string, farm: Farm) => {
    setModal({ type: 'farm', producerId, farm });
  };

  const handleDeleteFarm = (producerId: string, farmId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta fazenda? Esta ação não pode ser desfeita.')) {
      dispatch(deleteFarm({ producerId, farmId }));
    }
  };

  const handleProducerSubmit = async (data: Omit<Producer, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    
    try {
      if (modal.type === 'producer' && modal.producer) {
        // Update existing producer
        dispatch(updateProducer({
          ...modal.producer,
          ...data,
        }));
      } else {
        // Add new producer
        dispatch(addProducer(data));
      }
      
      setModal({ type: 'none' });
    } catch (error) {
      console.error('Error saving producer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmSubmit = async (data: Omit<Farm, 'id' | 'createdAt' | 'updatedAt' | 'producerId'>) => {
    setLoading(true);
    
    try {
      if (modal.type === 'farm') {
        if (modal.farm) {
          // Update existing farm
          dispatch(updateFarm({
            ...modal.farm,
            ...data,
            producerId: modal.producerId,
          }));
        } else {
          // Add new farm
          dispatch(addFarm({
            producerId: modal.producerId,
            farm: data,
          }));
        }
      }
      
      setModal({ type: 'none' });
    } catch (error) {
      console.error('Error saving farm:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModal({ type: 'none' });
  };

  return (
    <div>
      <FlexContainer justify="space-between" align="center" style={{ marginBottom: '2rem' }}>
        <PageTitle style={{ margin: 0 }}>Produtores Rurais</PageTitle>
        <Button onClick={handleAddProducer}>
          + Novo Produtor
        </Button>
      </FlexContainer>

      <ProducersList
        producers={producers}
        onEditProducer={handleEditProducer}
        onDeleteProducer={handleDeleteProducer}
        onAddFarm={handleAddFarm}
        onEditFarm={handleEditFarm}
        onDeleteFarm={handleDeleteFarm}
      />

      {/* Producer Form Modal */}
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
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            width: '100%',
          }}>
            <ProducerForm
              producer={modal.producer}
              onSubmit={handleProducerSubmit}
              onCancel={handleCloseModal}
              loading={loading}
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
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            width: '100%',
          }}>
            <FarmForm
              farm={modal.farm}
              onSubmit={handleFarmSubmit}
              onCancel={handleCloseModal}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};
