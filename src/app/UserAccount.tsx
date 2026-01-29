import { useState, useEffect, useContext } from 'react';
import DialogWrapper from '@/components/custom/DialogWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAxiosInstance } from '@/lib/axios-utils';
import { showSuccessToast } from '@/lib/toast-helper';
import AppContext from '@/store/AppContext';
import type { IUserData } from '@/lib/types';
import { generatePublicId } from '@/lib/utils';
import { LoadingCmp } from '@/components/custom';

interface IUserAccount {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

const UserAccount = ({ isDialogOpen, setIsDialogOpen }: IUserAccount) => {
  const { loggedInUser, setLoggedInUser } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userData, setUserData] = useState<IUserData | null>(null);
  const [formData, setFormData] = useState<Partial<IUserData>>({});

  useEffect(() => {
    if (isDialogOpen) {
      fetchUserData();
    }
  }, [isDialogOpen]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // const response = await getAxiosInstance().get('/user/profile');
      // setUserData(response);
      // setFormData(response);

      const data: IUserData = {
        user_id: loggedInUser.id,
        user_email: loggedInUser.email,
        user_mobile_no: loggedInUser.mobNo?.toString() || '',
        user_fname: loggedInUser.fname || '',
        user_lname: loggedInUser.lname || '',
        user_is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUserData(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof IUserData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const reqBody = {
        user_mobile_no: formData.user_mobile_no,
        user_fname: formData.user_fname,
        user_lname: formData.user_lname,
      };

      await getAxiosInstance().put(`/user-profile/${formData.user_id}`, reqBody);
      showSuccessToast({
        header: 'Success',
        description: 'User profile updated successfully',
      });
      setUserData(formData as IUserData);

      setLoggedInUser({
        ...loggedInUser,
        mobNo: formData.user_mobile_no,
        fname: formData.user_fname,
        lname: formData.user_lname,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving user data:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData || {});
    setIsDialogOpen(false);
  };

  return (
    <DialogWrapper
      open={isDialogOpen}
      setIsOpen={setIsDialogOpen}
      header="Edit User Profile"
      disableOutsideClick={true}
      actionsJSX={
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground flex items-center gap-1">
            <LoadingCmp />
            Loading user data...
          </div>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {/* User ID - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="user_id">User ID</Label>
            <Input id="user_id" value={formData.user_id ? generatePublicId(formData.user_id) : ''} disabled className="bg-muted" />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="user_email">Email</Label>
            <Input id="user_email" type="email" value={formData.user_email || ''} placeholder="Enter email address" disabled className="bg-muted" />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="user_mobile_no">Mobile Number</Label>
            <Input
              id="user_mobile_no"
              type="number"
              value={formData.user_mobile_no || ''}
              onChange={(e) => handleInputChange('user_mobile_no', e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="user_fname">First Name</Label>
            <Input
              id="user_fname"
              value={formData.user_fname || ''}
              onChange={(e) => handleInputChange('user_fname', e.target.value)}
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="user_lname">Last Name</Label>
            <Input
              id="user_lname"
              value={formData.user_lname || ''}
              onChange={(e) => handleInputChange('user_lname', e.target.value)}
              placeholder="Enter last name"
            />
          </div>

          {/* Active Status - Read Only */}
          {/* <div className="space-y-2">
            <Label htmlFor="user_is_active">Account Status</Label>
            <Input id="user_is_active" value={formData.user_is_active ? 'Active' : 'Inactive'} disabled className="bg-muted" />
          </div> */}

          {/* Created At - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="created_at">Joined On</Label>
            <Input id="created_at" value={formData.created_at ? new Date(formData.created_at).toLocaleString() : ''} disabled className="bg-muted" />
          </div>

          {/* Updated At - Read Only */}
          {/* <div className="space-y-2">
            <Label htmlFor="updated_at">Last Updated</Label>
            <Input id="updated_at" value={formData.updated_at ? new Date(formData.updated_at).toLocaleString() : ''} disabled className="bg-muted" />
          </div> */}
        </div>
      )}
    </DialogWrapper>
  );
};

export default UserAccount;
