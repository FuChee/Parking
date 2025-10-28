import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabase';

export const parkingApi = createApi({
  reducerPath: 'parkingApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Parking'],
  endpoints: (builder) => ({
    // Save parking slot
    saveParkingSlot: builder.mutation({
      async queryFn({ userId, slotLevel, slotNumber, latitude, longitude, elevation }) {
        try {
          const { error } = await supabase.from('parking_records').insert([
            {
              user_id: userId,
              level: slotLevel,
              slot_number: slotNumber,
              latitude,
              longitude,
              elevation,
            },
          ]);
          if (error) throw error;
          return { data: 'success' };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      invalidatesTags: ['Parking'],
    }),

    // Fetch user's parking records
    getParkingRecords: builder.query({
      async queryFn(userId) {
        try {
          const { data, error } = await supabase
            .from('parking_records')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return { data };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      providesTags: ['Parking'],
    }),

    // Delete a specific parking record
    deleteParkingRecord: builder.mutation({
      async queryFn(id) {
        try {
          const { error } = await supabase.from('parking_records').delete().eq('id', id);
          if (error) throw error;
          return { data: 'success' };
        } catch (error) {
          return { error: { message: error.message } };
        }
      },
      invalidatesTags: ['Parking'],
    }),
    updateLeaveTime: builder.mutation({
      async queryFn(id) {
        try {
          const { error } = await supabase
            .from('parking_records')
            .update({ left_at: new Date().toISOString() })
            .eq('id', id);
          if (error) throw error;
          return { data: { success: true } };
        } catch (err) {
          return { error: err.message };
        }
      },
      invalidatesTags: ['Parking'],
    }),
  }),
});

export const {
  useSaveParkingSlotMutation,
  useGetParkingRecordsQuery,
  useDeleteParkingRecordMutation,
  useUpdateLeaveTimeMutation,
} = parkingApi;