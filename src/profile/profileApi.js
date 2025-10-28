import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabase';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      async queryFn({ user_id, name, email }) {

        const { data, error } = await supabase
          .from('profiles')
          .update({ name, email })
          .eq('user_id', user_id)
          .select()

        if (error) {
          console.error('❌ Supabase update error:', error);
          return { error };
        }

        console.log('✅ Profile updated successfully:', data);
        return { data };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useUpdateProfileMutation } = profileApi;