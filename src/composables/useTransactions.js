// useTransactions.js - Composable for transaction management
import { ref, unref } from 'vue';
import { supabase } from '../lib/SupabaseClient';

export function useTransactions(userPhone) {
  const transactions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Fetch transactions from Supabase
  async function fetchTransactions() {
    const phone = unref(userPhone);
    
    if (!phone) {
      return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_phone', phone)
        .order('date', { ascending: false });
        
      if (fetchError) {
        throw fetchError;
      }
      
      transactions.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error('useTransactions: Error fetching transactions:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // Add new transaction
  async function addTransaction(transactionData) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert([transactionData]);
        
      if (insertError) throw insertError;
      
      // Refresh transactions after adding
      await fetchTransactions();
      
      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error('Error adding transaction:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  // Delete transaction
  async function deleteTransaction(transactionId) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);
        
      if (deleteError) throw deleteError;
      
      // Remove from local array
      const index = transactions.value.findIndex(t => t.id === transactionId);
      if (index !== -1) {
        transactions.value.splice(index, 1);
      }
      
      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting transaction:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  // Validate sell transaction
  function validateSellTransaction(brand, denom, count, userPhoneValue) {
    let totalGram = 0;
    let totalKeping = 0;
    
    transactions.value.forEach(t => {
      if (t.brand === brand && t.user_phone === userPhoneValue) {
        const gram = Number(t.denom) * Number(t.count);
        if (t.type === 'beli') {
          totalGram += gram;
          totalKeping += Number(t.count);
        } else if (t.type === 'jual') {
          totalGram -= gram;
          totalKeping -= Number(t.count);
        }
      }
    });
    
    // Check if user has any gold of this brand
    const hasAny = transactions.value.some(
      t => t.brand === brand && 
           t.user_phone === userPhoneValue && 
           t.type === 'beli'
    );
    
    if (!hasAny) {
      return {
        valid: false,
        message: `Anda tidak punya keping emas merek ${brand}`
      };
    }
    
    const jualGram = Number(denom) * Number(count);
    const jualKeping = Number(count);
    
    if (totalGram < jualGram || totalKeping < jualKeping) {
      return {
        valid: false,
        message: `Jumlah jual melebihi saldo emas ${brand} Anda (${totalGram.toFixed(2)} gr, ${totalKeping} keping)`
      };
    }
    
    return { valid: true };
  }

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    validateSellTransaction
  };
}
